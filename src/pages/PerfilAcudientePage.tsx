import { useEffect, useState } from 'react';
import AcudienteLayout from '../components/AcudienteLayout';
import { getSession } from '../api/endpoints';
import { httpService } from '../api/httpService';

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

  const getInitials = () => {
    const n = (perfil?.nombres || '').charAt(0).toUpperCase();
    const a = (perfil?.apellidos || '').charAt(0).toUpperCase();
    return `${n}${a}` || '?';
  };

  const nombreCompleto = [perfil?.nombres, perfil?.apellidos].filter(Boolean).join(' ');

  return (
    <AcudienteLayout>
      <div className="max-w-4xl mx-auto space-y-5 px-2 py-2">

        {/* ── HERO BANNER ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #1D9E75 60%, #5DCAA5 100%)' }}
        >
          <div
            className="absolute rounded-full"
            style={{ width: 220, height: 220, background: 'rgba(255,255,255,0.08)', top: -60, right: -60 }}
          />
          <div
            className="absolute rounded-full"
            style={{ width: 120, height: 120, background: 'rgba(255,255,255,0.06)', bottom: -30, left: 40 }}
          />
          <div className="relative z-10 flex items-center gap-4">
            {/* Avatar grande */}
            <div
              className="flex items-center justify-center rounded-2xl flex-shrink-0 text-white font-semibold text-xl"
              style={{
                width: 64, height: 64,
                background: 'rgba(255,255,255,0.2)',
                border: '1.5px solid rgba(255,255,255,0.35)',
              }}
            >
              {loading ? '…' : getInitials()}
            </div>
            <div>
              <div
                className="inline-flex items-center gap-2 mb-1 px-3 py-0.5 rounded-full text-xs text-white"
                style={{ background: 'rgba(255,255,255,0.18)', border: '0.5px solid rgba(255,255,255,0.3)' }}
              >
                <span
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: '#9FE1CB', display: 'inline-block' }}
                />
                Portal Acudiente
              </div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                {loading ? 'Mi Perfil' : nombreCompleto || 'Mi Perfil'}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Información personal del acudiente
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENIDO ── */}
        {loading ? (
          <div
            className="rounded-2xl p-6"
            style={{ background: '#fff', border: '0.5px solid rgba(29,158,117,0.15)' }}
          >
            <LoadingSkeleton />
          </div>
        ) : !perfil ? (
          <div
            className="rounded-2xl p-6"
            style={{ background: '#fff', border: '0.5px solid rgba(29,158,117,0.15)' }}
          >
            <EmptyState />
          </div>
        ) : (
          <>
            {/* Sección: Datos personales */}
            <Section titulo="Datos personales" icono={<IconPersona />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nombres" value={perfil.nombres} />
                <Field label="Apellidos" value={perfil.apellidos} />
                <Field label="Tipo de documento" value={perfil.tipoDocumento} />
                <Field label="Número de documento" value={perfil.numeroDocumento} />
                <Field label="Parentesco" value={perfil.parentesco} />
              </div>
            </Section>

            {/* Sección: Contacto */}
            <Section titulo="Contacto" icono={<IconContacto />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Correo electrónico" value={perfil.correo} wide />
                <Field label="Teléfono" value={perfil.telefono} />
                <Field label="Teléfono alternativo" value={perfil.telefonoAlternativo} />
                <Field label="Dirección" value={perfil.direccion} wide />
              </div>
            </Section>

            {/* Sección: Información laboral */}
            <Section titulo="Información laboral" icono={<IconTrabajo />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Ocupación" value={perfil.ocupacion} />
                <Field label="Tipo de trabajo" value={perfil.tipoTrabajo} />
                <Field label="Nivel educativo" value={perfil.nivelEducativo} />
                <Field label="Horario de trabajo" value={perfil.horarioTrabajo} />
                <Field
                  label="Aporta a la economía familiar"
                  value={perfil.aportaEconomia === undefined ? undefined : perfil.aportaEconomia ? 'Sí' : 'No'}
                  badge
                  badgeColor={perfil.aportaEconomia ? 'green' : 'gray'}
                />
              </div>
            </Section>
          </>
        )}

      </div>
    </AcudienteLayout>
  );
}

/* ── Componentes auxiliares ── */

function Section({ titulo, icono, children }: { titulo: string; icono: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '0.5px solid rgba(29,158,117,0.15)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '0.5px solid rgba(29,158,117,0.1)' }}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 32, height: 32, background: '#E1F5EE' }}
        >
          {icono}
        </div>
        <span className="font-medium text-sm" style={{ color: '#0F6E56' }}>
          {titulo}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  wide = false,
  badge = false,
  badgeColor = 'green',
}: {
  label: string;
  value?: string;
  wide?: boolean;
  badge?: boolean;
  badgeColor?: 'green' | 'gray';
}) {
  const badgeBg = badgeColor === 'green' ? '#E1F5EE' : '#F1EFE8';
  const badgeText = badgeColor === 'green' ? '#085041' : '#5F5E5A';

  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <div
        className="text-xs font-medium uppercase tracking-wide mb-1"
        style={{ color: '#0F6E56', opacity: 0.7, letterSpacing: '0.5px' }}
      >
        {label}
      </div>
      {badge && value ? (
        <div>
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: badgeBg, color: badgeText }}
          >
            {value}
          </span>
        </div>
      ) : (
        <div
          className="text-sm font-medium rounded-xl px-3 py-2"
          style={{
            background: value ? '#F7FDFB' : '#FAFAFA',
            border: '0.5px solid rgba(29,158,117,0.12)',
            color: value ? '#085041' : '#aaa',
          }}
        >
          {value || '—'}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-10 rounded-xl" style={{ background: 'rgba(29,158,117,0.08)' }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <div
        className="flex items-center justify-center rounded-full mb-1"
        style={{ width: 44, height: 44, background: '#E1F5EE' }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="9" />
          <path d="M11 8v4M11 14.5h.01" />
        </svg>
      </div>
      <p className="text-sm" style={{ color: '#0F6E56', opacity: 0.7 }}>
        No se encontró información del perfil.
      </p>
    </div>
  );
}

/* ── Iconos ── */
function IconPersona() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

function IconContacto() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1z" />
      <path d="M5 6h6M5 9h4" />
    </svg>
  );
}

function IconTrabajo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="12" height="8" rx="1.5" />
      <path d="M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      <path d="M8 10v.01" />
    </svg>
  );
}