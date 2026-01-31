import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconTarget,
  IconUsers,
  IconBook,
  IconClipboard,
  IconArrowRight,
  IconCheck,
  IconX,
  IconInfo,
  IconSettings,
  IconAlertTriangle
} from '../ui/Icons';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  actionLink: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface GuideProps {
  institutionName?: string;
  stats: {
    totalCoordinadores: number;
    totalOrientadores: number;
    totalDocentes: number;
    totalCursos: number;
    tasaActivacion: number;
  };
}

export default function RectorGuide({ institutionName, stats }: GuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showGuide, setShowGuide] = useState(true);

  // Generar pasos dinámicamente basados en el estado actual
  const generateSteps = (): GuideStep[] => {
    const steps: GuideStep[] = [];

    // Paso 1: Configurar Coordinador (si no hay)
    if (stats.totalCoordinadores === 0) {
      steps.push({
        id: 'coordinador',
        title: 'Asignar Coordinador Académico',
        description: 'El coordinador es fundamental para gestionar el área académica, supervisar docentes y asegurar la calidad educativa.',
        icon: <IconUsers className="w-6 h-6" />,
        action: 'Crear Coordinador',
        actionLink: '/directivos?action=create&role=coordinador',
        completed: false,
        priority: 'high'
      });
    }

    // Paso 2: Configurar Orientador (si no hay)
    if (stats.totalOrientadores === 0) {
      steps.push({
        id: 'orientador',
        title: 'Asignar Orientador Escolar',
        description: 'El orientador proporciona acompañamiento vocacional y emocional a los estudiantes, apoyando su desarrollo integral.',
        icon: <IconUsers className="w-6 h-6" />,
        action: 'Crear Orientador',
        actionLink: '/directivos?action=create&role=orientador',
        completed: false,
        priority: 'high'
      });
    }

    // Paso 3: Configurar Cursos (si no hay)
    if (stats.totalCursos === 0) {
      steps.push({
        id: 'cursos',
        title: 'Configurar Cursos Académicos',
        description: 'Establece la estructura de cursos para que los docentes puedan asignar tareas y gestionar sus clases efectivamente.',
        icon: <IconBook className="w-6 h-6" />,
        action: 'Configurar Cursos',
        actionLink: '/cursos?action=create',
        completed: false,
        priority: 'high'
      });
    }

    // Paso 4: Activar Personal (si tasa de activación es baja)
    if (stats.tasaActivacion < 80 && (stats.totalCoordinadores > 0 || stats.totalOrientadores > 0)) {
      steps.push({
        id: 'activacion',
        title: 'Activar Personal Inactivo',
        description: `${Math.round(100 - stats.tasaActivacion)}% de tu personal está inactivo. Actívalos para asegurar el funcionamiento correcto de la institución.`,
        icon: <IconAlertTriangle className="w-6 h-6" />,
        action: 'Ver Personal',
        actionLink: '/directivos?filter=inactive',
        completed: false,
        priority: 'medium'
      });
    }

    // Paso 5: Revisar Reportes (siempre disponible)
    steps.push({
      id: 'reportes',
      title: 'Generar Primer Reporte',
      description: 'Revisa las estadísticas iniciales de tu institución para tener una línea base y monitorear el progreso.',
      icon: <IconClipboard className="w-6 h-6" />,
      action: 'Ver Reportes',
      actionLink: '/reportes/rector',
      completed: false,
      priority: 'low'
    });

    return steps;
  };

  const steps = generateSteps();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-700';
      case 'medium': return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!showGuide || steps.length === 0) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <IconTarget className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900 mb-1">
              🎯 Guía de Configuración Inicial
            </h3>
            <p className="text-sm text-indigo-700">
              {institutionName ? `Configurando ${institutionName}` : 'Configurando tu institución'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGuide(false)}
          className="text-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <IconX className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-indigo-600 mb-2">
          <span>Paso {currentStep + 1} de {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% completado</span>
        </div>
        <div className="w-full bg-indigo-100 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className={`border rounded-lg p-4 ${getPriorityColor(currentStepData.priority)}`}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            {currentStepData.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{currentStepData.title}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(currentStepData.priority)}`}>
                {currentStepData.priority === 'high' ? 'Crítico' : 
                 currentStepData.priority === 'medium' ? 'Importante' : 'Recomendado'}
              </span>
            </div>
            <p className="text-sm mb-3">{currentStepData.description}</p>
            <Link
              to={currentStepData.actionLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {currentStepData.action}
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        <div className="flex gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-indigo-600' : 
                index < currentStep ? 'bg-indigo-300' : 'bg-indigo-100'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-white/60 rounded-lg border border-indigo-100">
        <div className="flex items-start gap-2">
          <IconInfo className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-indigo-700">
            <p className="font-medium mb-1">💡 Consejo Rápido:</p>
            <p>
              {currentStepData.priority === 'high' && 'Estos pasos son críticos para el funcionamiento básico de tu institución.'}
              {currentStepData.priority === 'medium' && 'Estas acciones mejoran significativamente la operación diaria.'}
              {currentStepData.priority === 'low' && 'Estos son pasos recomendados para optimizar la gestión.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
