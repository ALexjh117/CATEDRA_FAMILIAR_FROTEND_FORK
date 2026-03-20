import { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import AcudienteLayout from '../components/AcudienteLayout';

import LoadingSpinner from '../components/ui/LoadingSpinner';

import Button from '../components/ui/Button';

import { getDetalleAsignacionMovil, enviarEntregaMovil, type DetalleAsignacionMovil } from '../api/acudiente';

import { getPendingEntregaOffline, saveEntregaOffline, syncPendingEntregas, type OfflineEntregaRecord } from '../services/offlineEntregaSync';

import Swal from 'sweetalert2';



function useQuery(){ const { search } = useLocation(); return new URLSearchParams(search); }



export default function AcudienteAsignacionDetallePage(){

  const { id } = useParams();

  const asignacionId = Number(id);

  const query = useQuery();

  const [estudianteIdEff, setEstudianteIdEff] = useState<number>(0);

  const navigate = useNavigate();

  const location = useLocation();



  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string|null>(null);

  const [detalle, setDetalle] = useState<DetalleAsignacionMovil | null>(null);



  const [descripcion, setDescripcion] = useState('');

  const [nombreEnvio, setNombreEnvio] = useState('');

  const [archivos, setArchivos] = useState<File[]>([]);

  const [archivosUrl, setArchivosUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [enviando, setEnviando] = useState(false);

  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  const [offlineEntrega, setOfflineEntrega] = useState<OfflineEntregaRecord | null>(null);

  const [syncingOffline, setSyncingOffline] = useState(false);



  const parseDate = (s?: string) => {

    if (!s) return null as Date | null;

    const d = new Date(s);

    return isNaN(d.getTime()) ? null : d;

  };

  const normalizeDeadline = (s?: string) => {

    const d = parseDate(s);

    if (!d) return null as Date | null;

    const isMidnightUTC = d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0;

    if (isMidnightUTC) {

      const local = new Date(d);

      local.setHours(23, 59, 59, 999);

      return local;

    }

    return d;

  };



  const load = async () => {

    if (!asignacionId) return;

    setLoading(true);

    setError(null);

    try {

      const data = await getDetalleAsignacionMovil(asignacionId);

      setDetalle(data);

    } catch (e: any) {

      // Si falla (404), usar fallback desde router state para permitir enviar

      const state = (location as any).state as any;

      const a = state?.asignacion;

      if (a) {

        setDetalle({

          id: asignacionId,

          titulo: a.titulo || 'Tarea',

          descripcion: a.descripcion || '',

          fechaVencimiento: a.fechaVencimiento || a.fecha_vencimiento,

          curso: a.cursoNombre ? { id: a.cursoId || a.curso_id, nombre: a.cursoNombre } : undefined,

          entrega: null,

        });

      } else {

        setError(e?.message || 'Error al cargar detalle');

      }

    } finally { setLoading(false); }

  };



  useEffect(() => { load(); }, [asignacionId]);



  useEffect(() => {

    if (!asignacionId || !estudianteIdEff) return;

    getPendingEntregaOffline(asignacionId, estudianteIdEff)

      .then(setOfflineEntrega)

      .catch(() => setOfflineEntrega(null));

  }, [asignacionId, estudianteIdEff]);



  useEffect(() => {

    const refreshOfflineState = async () => {

      if (!asignacionId || !estudianteIdEff) return;

      const pending = await getPendingEntregaOffline(asignacionId, estudianteIdEff);

      setOfflineEntrega(pending);

      if (!pending) {

        await load();

      }

    };



    const handleOnline = async () => {

      setIsOnline(true);

      const currentOfflineId = offlineEntrega?.id;

      setSyncingOffline(true);

      try {

        const results = await syncPendingEntregas();

        await refreshOfflineState();

        if (currentOfflineId) {

          const currentResult = results.find((item) => item.offlineId === currentOfflineId);

          if (currentResult?.status === 'success') {

            await Swal.fire({ icon: 'success', title: 'Entrega sincronizada', text: 'La entrega pendiente ya fue enviada al servidor con su fecha original.' });

          } else if (currentResult?.status === 'error') {

            await Swal.fire({ icon: 'error', title: 'No se pudo sincronizar', text: currentResult.error || 'La entrega sigue guardada y se volverá a intentar cuando haya conexión.' });

          }

        }

      } finally {

        setSyncingOffline(false);

      }

    };



    const handleOffline = () => {

      setIsOnline(false);

    };



    if (typeof window === 'undefined') return;



    window.addEventListener('online', handleOnline);

    window.addEventListener('offline', handleOffline);



    if (typeof navigator !== 'undefined' && navigator.onLine) {

      handleOnline();

    }



    return () => {

      window.removeEventListener('online', handleOnline);

      window.removeEventListener('offline', handleOffline);

    };

  }, [asignacionId, estudianteIdEff, offlineEntrega?.id]);



  // Resolver estudianteId desde query o localStorage si falta

  useEffect(() => {

    const q = Number(query.get('estudianteId'));

    if (q && !Number.isNaN(q)) { setEstudianteIdEff(q); return; }

    try {

      const v = localStorage.getItem('acudiente_estudiante_id');

      const nid = v ? Number(v) : 0;

      if (nid && !Number.isNaN(nid)) setEstudianteIdEff(nid);

    } catch {}

  }, [query]);



  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {

    const files = e.target.files;

    if (!files) return;

    setArchivos(Array.from(files));

  };



  const onSubmit = async () => {

    if (!estudianteIdEff) { alert('Falta estudianteId'); return; }

    const urls = archivosUrl.split('\n').map(s => s.trim()).filter(Boolean);

    if (detalle?.entrega || offlineEntrega) {

      // Ya existe entrega: mostrar aviso y no permitir nuevo envío

      const fechaEntregaRef = detalle?.entrega?.fechaEntrega || offlineEntrega?.createdAt;

      const v = detalle?.fechaVencimiento ? new Date(detalle.fechaVencimiento) : null;

      const f = fechaEntregaRef ? new Date(fechaEntregaRef) : null;

      const esTardia = v && f ? (f.getTime() > v.getTime()) : false;

      await Swal.fire({

        icon: 'info',

        title: 'Ya entregaste esta tarea',

        html: `<div style="text-align:left">`+

              `<div><b>Estado:</b> ${offlineEntrega ? 'Pendiente de sincronización' : (esTardia ? 'Entregada con retraso' : 'Entregada')}</div>`+

              `${detalle.calificacion ? `<div><b>Calificación:</b> ${(detalle.calificacion.nota as any)?.toFixed ? (detalle.calificacion.nota as any).toFixed(1) : detalle.calificacion.nota} • ${detalle.calificacion.escala}${detalle.calificacion.esAutomatica ? ' (Automática)' : ''}</div>` : ''}`+

              `</div>`,

        confirmButtonText: 'Entendido'

      });

      return;

    }

    setEnviando(true);

    try {

      if (!isOnline) {

        const pending = await saveEntregaOffline({

          asignacionId,

          estudianteId: estudianteIdEff,

          descripcion: descripcion || undefined,

          nombreEnvio: nombreEnvio || undefined,

          archivos: archivos.length ? archivos : undefined,

          archivosUrl: urls.length ? urls : undefined,

        });

        setOfflineEntrega(pending);

        setDescripcion('');

        setNombreEnvio('');

        setArchivos([]);

        setArchivosUrl('');

        if (fileInputRef.current) fileInputRef.current.value = '';

        await Swal.fire({ icon: 'success', title: 'Entrega guardada sin internet', text: 'Se sincronizará automáticamente cuando vuelva la conexión.' });

        return;

      }

      const res = await enviarEntregaMovil(asignacionId, {

        estudianteId: estudianteIdEff,

        descripcion: descripcion || undefined,

        nombreEnvio: nombreEnvio || undefined,

        archivos: archivos.length ? archivos : undefined,

        archivosUrl: urls.length ? urls : undefined,

      });

      const entrega = (res && typeof res === 'object' && 'data' in res) ? (res as any).data : res;

      if (entrega) {

        setDetalle((prev) => prev ? ({ ...prev, entrega: {

          id: entrega.id,

          descripcion: entrega.descripcion,

          fechaEntrega: entrega.fechaEntrega,

          archivos: Array.isArray(entrega.archivos) ? entrega.archivos : [],

          estado: entrega.estado || 'entregada',

          nombreEnvio: entrega.nombreEnvio,

        }, calificacion: entrega.calificacion ? {

          nota: entrega.calificacion.nota,

          escala: entrega.calificacion.escala,

          esAutomatica: !!entrega.calificacion.esAutomatica,

          retroalimentacion: entrega.calificacion.retroalimentacion,

          notaCualitativa: entrega.calificacion.notaCualitativa,

          calificadoPor: entrega.calificacion.calificadoPor,

          fechaCalificacion: entrega.calificacion.fechaCalificacion,

        } : prev?.calificacion }) : prev);

      }

      // recargar y limpiar

      setDescripcion('');

      setNombreEnvio('');

      setArchivos([]);

      setArchivosUrl('');

      setOfflineEntrega(null);

      if (fileInputRef.current) fileInputRef.current.value = '';

      await load();

      const estadoTxt = entrega?.estado === 'entregada_tardia' ? 'Entregada con retraso' : 'Entregada';

      const notaTxt = entrega?.calificacion?.nota != null ? ` • Nota: ${Number(entrega.calificacion.nota).toFixed(1)} (${entrega.calificacion.escala})` : '';

      await Swal.fire({ icon: 'success', title: 'Entrega enviada', text: `${estadoTxt}${notaTxt}` });

    } catch (e: any) {

      // Intentar parsear JSON del backend (p.ej., 409 Conflict con data de la entrega existente)

      try {

        const parsed = JSON.parse(e?.message || '');

        if (parsed && parsed.data) {

          const entrega = parsed.data;

          setDetalle((prev) => prev ? ({ ...prev, entrega: {

            id: entrega.id,

            descripcion: entrega.descripcion,

            fechaEntrega: entrega.fechaEntrega,

            archivos: Array.isArray(entrega.archivos) ? entrega.archivos : [],

            estado: entrega.estado || 'entregada',

            nombreEnvio: entrega.nombreEnvio,

          } }) : prev);

          const estadoTxt = entrega?.estado === 'entregada_tardia' ? 'Entregada con retraso' : 'Entregada';

          await Swal.fire({ icon: 'info', title: 'Ya entregaste', text: estadoTxt });

          return;

        }

      } catch {}

      await Swal.fire({ icon: 'error', title: 'No se pudo enviar', text: e?.message || 'Intenta de nuevo más tarde.' });

    } finally { setEnviando(false); }

  };



  return (

    <AcudienteLayout>

      <div className="space-y-4">

        {loading ? (

          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>

        ) : error ? (

          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>

        ) : !detalle ? (

          <div className="p-4 bg-amber-50 text-amber-700 rounded-xl">No se encontró la asignación.</div>

        ) : (

          <div className="space-y-4">

            <div className="bg-white border rounded-2xl p-4">

              <h1 className="text-xl font-semibold text-slate-800">{detalle.titulo}</h1>

              <p className="mt-1 text-slate-700">{detalle.descripcion}</p>

              <div className={`mt-3 rounded-2xl border px-3 py-2 text-sm ${isOnline ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>

                {isOnline ? 'Con conexión a internet.' : 'Sin conexión. Las entregas nuevas se guardarán en este dispositivo.'}

              </div>

              {offlineEntrega && (

                <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-800">

                  <div className="font-semibold">Entrega pendiente de sincronización</div>

                  <div className="mt-1">Fecha original guardada: {offlineEntrega.createdAt}</div>

                  <div className="mt-1">Estado: {syncingOffline ? 'Sincronizando...' : 'Pendiente'}</div>

                </div>

              )}

              <div className="mt-2 text-sm text-slate-500">Curso: {detalle.curso?.nombre || '-'}</div>

              <div className="mt-1 text-sm text-slate-500">Vence: {detalle.fechaVencimiento || '-'}</div>

              {detalle.entrega && !offlineEntrega && (

                <div className="mt-2">

                  <span className={`inline-block px-2 py-1 rounded-lg text-xs border ${(()=>{ const v = normalizeDeadline(detalle.fechaVencimiento || undefined); const f = detalle.entrega?.fechaEntrega ? parseDate(detalle.entrega.fechaEntrega) : null; const tardia = v && f ? (f.getTime() > v.getTime()) : false; return tardia ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'; })()}`}>

                    {(()=>{ const v = normalizeDeadline(detalle.fechaVencimiento || undefined); const f = detalle.entrega?.fechaEntrega ? parseDate(detalle.entrega.fechaEntrega) : null; const tardia = v && f ? (f.getTime() > v.getTime()) : false; return tardia ? 'Entregada con retraso' : 'Entregada'; })()}

                  </span>

                </div>

              )}

            </div>



            <div className="bg-white border rounded-2xl p-4">

              <h2 className="font-semibold text-slate-800">Mi entrega</h2>

              {offlineEntrega ? (

                <div className="mt-2 text-sm text-sky-800">

                  <div>Estado: <span className="font-medium">Pendiente de sincronización</span></div>

                  <div>Fecha original de envío: {offlineEntrega.createdAt}</div>

                  {offlineEntrega.nombreEnvio && <div>Nombre del envío: {offlineEntrega.nombreEnvio}</div>}

                  {offlineEntrega.descripcion && <div className="mt-1">Descripción: {offlineEntrega.descripcion}</div>}

                  {Array.isArray(offlineEntrega.archivos) && offlineEntrega.archivos.length > 0 && (

                    <div className="mt-2">Archivos: {offlineEntrega.archivos.map((archivo) => archivo.name).join(', ')}</div>

                  )}

                  {Array.isArray(offlineEntrega.archivosUrl) && offlineEntrega.archivosUrl.length > 0 && (

                    <div className="mt-2">URLs: {offlineEntrega.archivosUrl.join(', ')}</div>

                  )}

                </div>

              ) : detalle.entrega ? (

                <div className="mt-2 text-sm">

                  <div>Estado: <span className="font-medium">{detalle.entrega.estado}</span></div>

                  <div>Fecha de entrega: {detalle.entrega.fechaEntrega}</div>

                  {Array.isArray(detalle.entrega.archivos) && detalle.entrega.archivos.length > 0 && (

                    <ul className="list-disc pl-6 mt-2">

                      {detalle.entrega.archivos.map((a, idx) => {

                        const api = '/api';

                        const cleaned = String(api).replace(/\/$/, '');

                        // remove trailing /api or /api/movil to get server origin

                        const origin = cleaned.replace(/\/api(\/movil)?$/, '');

                        const href = a.url?.startsWith('http') ? a.url : `${origin}${a.url?.startsWith('/') ? '' : '/'}${a.url || ''}`;

                        return (

                          <li key={idx}>

                            <a className="text-teal-700 underline" href={href} target="_blank" rel="noopener noreferrer">

                              {a.originalName || a.fileName || `Archivo ${idx+1}`}

                            </a>

                          </li>

                        );

                      })}

                    </ul>

                  )}

                </div>

              ) : (

                <div className="text-slate-500 text-sm">Sin entrega aún.</div>

              )}

            </div>



            {detalle.calificacion && (

              <div className="bg-white border rounded-2xl p-4">

                <h2 className="font-semibold text-slate-800">Calificación</h2>

                <div className="mt-2 text-sm">

                  <div>Nota: <span className="font-semibold">{detalle.calificacion.nota.toFixed ? detalle.calificacion.nota.toFixed(1) : detalle.calificacion.nota}</span></div>

                  <div>Escala: {detalle.calificacion.escala}</div>

                  {detalle.calificacion.esAutomatica && (

                    <div className="inline-block mt-1 px-2 py-0.5 rounded-lg text-xs bg-sky-50 text-sky-700 border border-sky-200">Automática</div>

                  )}

                  {detalle.calificacion.retroalimentacion && (

                    <div className="mt-1">Retroalimentación: {detalle.calificacion.retroalimentacion}</div>

                  )}

                </div>

              </div>

            )}



            {/* Formulario de envío */}

            <div className="bg-white border rounded-2xl p-4 space-y-3">

              <h2 className="font-semibold text-slate-800">Enviar evidencia</h2>

              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del envío (opcional)</label>

                <input className="w-full px-3 py-2 rounded-xl border-2 border-gray-200" value={nombreEnvio} onChange={(e)=>setNombreEnvio(e.target.value)} />

              </div>

              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción (opcional)</label>

                <textarea className="w-full px-3 py-2 rounded-xl border-2 border-gray-200" rows={3} value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} />

              </div>

              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">Archivos (puedes seleccionar varios)</label>

                <input ref={fileInputRef} type="file" multiple onChange={onPickFiles} />

              </div>

              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">URLs de archivos (una por línea)</label>

                <textarea className="w-full px-3 py-2 rounded-xl border-2 border-gray-200" rows={3} placeholder="https://..." value={archivosUrl} onChange={(e)=>setArchivosUrl(e.target.value)} />

              </div>

              <div className="pt-2">

                <Button onClick={onSubmit} disabled={enviando || syncingOffline || !estudianteIdEff || !!detalle?.entrega || !!offlineEntrega}>{enviando ? 'Enviando...' : syncingOffline ? 'Sincronizando...' : !isOnline ? 'Guardar sin internet' : 'Enviar'}</Button>

              </div>

            </div>



            <div>

              <Button variant="outline" onClick={()=>navigate(-1)}>Volver</Button>

            </div>

          </div>

        )}

      </div>

    </AcudienteLayout>

  );

}

