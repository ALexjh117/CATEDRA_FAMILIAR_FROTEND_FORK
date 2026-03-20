import React from 'react'
import { Link } from 'react-router-dom'

const projectTeam = [
  {
    name: 'Henry Bastidas',
    role: 'Product Owner',
    github: '',
    accent: 'bg-amber-100 text-amber-700',
    initial: 'H',
  },
]

const developers = [
  {
    name: 'Alex Jhoan Chaguendo',
    role: 'Full Stack Developer',
    github: 'Alexjh117',
    accent: 'bg-teal-100 text-teal-700',
    initial: 'A',
  },
  {
    name: 'Brayan Hurtado',
    role: 'Full Stack Developer',
    github: '',
    accent: 'bg-sky-100 text-sky-700',
    initial: 'B',
  },
  {
    name: 'Fernanda Gonzalez',
    role: 'Full Stack Developer',
    github: '',
    accent: 'bg-rose-100 text-rose-700',
    initial: 'F',
  },
]

export default function EquipoDesarrolloPage(){
  return (
    <div className="min-h-screen bg-[#f6f3ef] text-gray-900">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/src/assets/logo.jpg" alt="Logo Cátedra de Familia" className="w-12 h-12 rounded-lg shadow-md object-cover" />
            <div>
              <div className="text-xl font-display font-bold text-gray-900">Cátedra</div>
              <div className="-mt-0.5 text-xs text-gray-600">de Familia</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Volver al inicio
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white shadow-md transition-all hover:bg-teal-700 hover:shadow-lg"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-81px)] w-full px-5 py-10 md:px-10 md:py-14">
        <section className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Equipo de Desarrollo</p>
              <h1 className="mt-3 text-4xl font-display font-bold tracking-tight text-gray-900 md:text-5xl">Nuestro equipo</h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
                Conoce a las personas que lideran y construyen Cátedra de Familia.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              Ingresar
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Volver al inicio
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-14 w-full max-w-6xl">
          <h2 className="text-2xl font-display font-bold text-gray-900">Manejo del proyecto</h2>
          <div className="mt-6 space-y-6">
            {projectTeam.map((member) => (
              <article key={member.name} className="flex items-center gap-4 border-b border-black/10 py-5 transition">
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold ${member.accent}`}>
                  {member.initial}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-base text-gray-600">{member.role}</p>
                  {member.github ? (
                    <p className="mt-1 text-sm text-gray-500">
                      GitHub:{' '}
                      <a
                        href={`https://github.com/${member.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-teal-700 underline hover:text-teal-800"
                      >
                        @{member.github}
                      </a>
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-6xl pb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900">Desarrolladores</h2>
          <div className="mt-6 space-y-6">
            {developers.map((member) => (
              <article key={member.name} className="flex items-center gap-4 border-b border-black/10 py-5 transition">
                {/* Foto de perfil para Alex Jhoan */}
                {member.name === 'Alex Jhoan Chaguendo' ? (
                  <img 
                    src="/src/assets/img_familias/foto-git-3.png" 
                    alt="Foto de Alex Jhoan"
                    className="h-20 w-20 shrink-0 rounded-full object-cover border-4 border-teal-200"
                  />
                ) : (
                  <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold ${member.accent}`}>
                    {member.initial}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-base text-gray-600">{member.role}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    GitHub:{' '}
                    <a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-teal-700 underline hover:text-teal-800"
                    >
                      @{member.github}
                    </a>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
