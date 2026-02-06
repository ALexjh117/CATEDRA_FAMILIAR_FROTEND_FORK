import { useEffect, useState } from 'react';
import AcudienteLayout from '../components/AcudienteLayout';
import { getSession } from '../api/endpoints';
import httpService from '../api/httpService';

interface PerfilAcudiente {
  nombres?: string;
  apellidos?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  telefono?: string;
  telefonoAlternativo?: string;
  correo?: string;
  direccion?: string;
  parentesco?: string;
  ocupacion?: string;
  tipoTrabajo?: string;
  nivelEducativo?: string;
  aportaEconomia?: boolean;
  horarioTrabajo?: string;
}

export default function PerfilAcudientePage() {
  const session = getSession();
  const [perfil, setPerfil] = useState<PerfilAcudiente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPerfil() {
      try {
        // Intentar endpoint /acudientes/me si existe en backend
        const res = await httpService.get<any>('/acudientes/me');
        if (mounted && res?.data) {
          const a = res.data;
          setPerfil({
            nombres: a.nombres,
            apellidos: a.apellidos,
            tipoDocumento: a.tipoDocumento ?? a.tipo_documento,
            numeroDocumento: a.numeroDocumento ?? a.numero_documento,
            telefono: a.telefono,
            telefonoAlternativo: a.telefonoAlternativo ?? a.telefono_alternativo,
            correo: a.correo,
            direccion: a.direccion,
            parentesco: a.parentesco,
            ocupacion: a.ocupacion,
            tipoTrabajo: a.tipoTrabajo ?? a.tipo_trabajo,
            nivelEducativo: a.nivelEducativo ?? a.nivel_educativo,
            aportaEconomia: a.aportaEconomia ?? a.aporta_economia,
            horarioTrabajo: a.horarioTrabajo ?? a.horario_trabajo,
          });
          setLoading(false);
          return;
        }
      } catch (_) {
        // Fallback a datos de sesión si no existe el endpoint
        const ctx = (session as any)?.context;
        const acudiente = ctx?.acudiente || ctx?.usuario || {};
        if (mounted) {
          setPerfil({
            nombres: acudiente.nombres,
            apellidos: acudiente.apellidos,
            tipoDocumento: acudiente.tipoDocumento,
            numeroDocumento: acudiente.numeroDocumento,
            telefono: acudiente.telefono,
            telefonoAlternativo: acudiente.telefonoAlternativo,
            correo: acudiente.correo ?? session?.user?.correo,
            direccion: acudiente.direccion,
            parentesco: acudiente.parentesco,
            ocupacion: acudiente.ocupacion,
            tipoTrabajo: acudiente.tipoTrabajo,
            nivelEducativo: acudiente.nivelEducativo,
            aportaEconomia: acudiente.aportaEconomia,
            horarioTrabajo: acudiente.horarioTrabajo,
          });
          setLoading(false);
        }
      }
    }

    fetchPerfil();
    return () => { mounted = false; };
  }, []);

  return (
    <AcudienteLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Mi Perfil</h1>
            <p className="text-slate-600 mt-1 text-sm">Información personal del acudiente</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          {loading ? (
            <div className="text-slate-600">Cargando perfil...</div>
          ) : !perfil ? (
            <div className="text-slate-600">No se encontró información del perfil.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Nombres" value={perfil.nombres} />
              <Field label="Apellidos" value={perfil.apellidos} />
              <Field label="Tipo de Documento" value={perfil.tipoDocumento} />
              <Field label="Número de Documento" value={perfil.numeroDocumento} />
              <Field label="Teléfono" value={perfil.telefono} />
              <Field label="Teléfono Alternativo" value={perfil.telefonoAlternativo} />
              <Field label="Correo" value={perfil.correo} />
              <Field label="Dirección" value={perfil.direccion} />
              <Field label="Parentesco" value={perfil.parentesco} />
              <Field label="Ocupación" value={perfil.ocupacion} />
              <Field label="Tipo de Trabajo" value={perfil.tipoTrabajo} />
              <Field label="Nivel Educativo" value={perfil.nivelEducativo} />
              <Field label="Aporta a la Economía" value={perfil.aportaEconomia ? 'Sí' : 'No'} />
              <Field label="Horario de Trabajo" value={perfil.horarioTrabajo} />
            </div>
          )}
        </div>
      </div>
    </AcudienteLayout>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className="mt-1 text-slate-800 font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        {value || '—'}
      </div>
    </div>
  );
}
