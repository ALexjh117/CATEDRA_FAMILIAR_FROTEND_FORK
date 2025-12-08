import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/endpoints';
import FormFieldInput from '../components/ui/FormFieldInput';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    recordar: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    const checked = (target as HTMLInputElement).type === 'checkbox' ? (target as HTMLInputElement).checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: (target as HTMLInputElement).type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.correo, formData.password);
      
      if (result.success && result.user) {
        // Redirigir según el rol
        const rol = result.user.rol;
        switch (rol) {
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'rector':
            navigate('/dashboard/rector');
            break;
          case 'coordinador':
            navigate('/dashboard/coordinador');
            break;
          case 'orientador':
            navigate('/dashboard/orientador');
            break;
          case 'docente_aula':
            navigate('/dashboard/docente');
            break;
          case 'acudiente':
            // Acudientes deben usar la app móvil
            navigate('/acceso-denegado');
            break;
          default:
            navigate('/dashboard/docente');
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-brand-50/30 to-blue-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <img 
              src="/src/assets/logo.jpg" 
              alt="Logo Cátedra de Familia" 
              className="w-16 h-16 rounded-xl shadow-lg object-cover" 
            />
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Bienvenido a <span className="text-teal-600">Cátedra de Familia</span>
          </h1>
          <p className="text-gray-600 mt-2">Ingresa a tu cuenta para continuar</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormFieldInput
              label="Correo electrónico"
              name="correo"
              type="email"
              placeholder="tu@correo.com"
              value={formData.correo}
              onChange={handleChange}
              required
            />

            <FormFieldInput
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="recordar"
                  checked={formData.recordar}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿Eres padre de familia?{' '}
              <span className="text-teal-600 font-semibold">
                Descarga la app móvil 📱
              </span>
            </p>
          </div>

          {/* Modo Demo */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500 mb-3">
              O prueba con credenciales de demo:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, correo: 'garcia@docente.com', password: '12345678' })}
                className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                👨‍🏫 Docente
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, correo: 'orientador@docente.com', password: '12345678' })}
                className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                🎯 Orientador
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, correo: 'coordinador@docente.com', password: '12345678' })}
                className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                📋 Coordinador
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, correo: 'rector@docente.com', password: '12345678' })}
                className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                🏛️ Rector
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, correo: 'admin@admin.com', password: '12345678' })}
                className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors col-span-2"
              >
                ⚙️ Admin
              </button>
            </div>
          </div>
        </div>

        {/* Link a landing */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
