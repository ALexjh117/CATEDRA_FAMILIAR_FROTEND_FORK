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
  IconAlertTriangle,
  IconFilter,
  IconGraduationCap,
  IconTrendingUp
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
    totalDocentes: number;
    totalEstudiantes: number;
    totalCursos: number;
    totalGrados: number;
    tareasActivas: number;
    tasaCumplimiento: number;
    docentesConTareas: number;
    tareasVencidas: number;
  };
}

export default function CoordinadorGuide({ institutionName, stats }: GuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showGuide, setShowGuide] = useState(true);

  // Generar pasos dinámicamente basados en el estado actual
  const generateSteps = (): GuideStep[] => {
    const steps: GuideStep[] = [];

    // Paso 1: Configurar Docentes (si no hay)
    if (stats.totalDocentes === 0) {
      steps.push({
        id: 'docentes',
        title: 'Asignar Docentes',
        description: 'Los docentes son fundamentales para impartir las clases y gestionar el aprendizaje de los estudiantes.',
        icon: <IconUsers className="w-6 h-6" />,
        action: 'Asignar Docentes',
        actionLink: '/docentes?action=create',
        completed: false,
        priority: 'high'
      });
    }

    // Paso 2: Configurar Cursos (si no hay)
    if (stats.totalCursos === 0) {
      steps.push({
        id: 'cursos',
        title: 'Configurar Cursos Académicos',
        description: 'Establece la estructura de cursos para organizar a los estudiantes y asignar docentes.',
        icon: <IconFilter className="w-6 h-6" />,
        action: 'Configurar Cursos',
        actionLink: '/cursos?action=create',
        completed: false,
        priority: 'high'
      });
    }

    // Paso 3: Registrar Estudiantes (si no hay)
    if (stats.totalEstudiantes === 0) {
      steps.push({
        id: 'estudiantes',
        title: 'Registrar Estudiantes',
        description: 'Registra los estudiantes en el sistema para asignarlos a cursos y seguir su progreso académico.',
        icon: <IconGraduationCap className="w-6 h-6" />,
        action: 'Registrar Estudiantes',
        actionLink: '/estudiantes?action=create',
        completed: false,
        priority: 'high'
      });
    }

    // Paso 4: Revisar Tareas Vencidas (si hay tareas vencidas)
    if (stats.tareasVencidas > 0) {
      steps.push({
        id: 'tareas_vencidas',
        title: 'Revisar Tareas Vencidas',
        description: `Hay ${stats.tareasVencidas} tarea(s) vencida(s) que requieren atención inmediata para mantener el ritmo académico.`,
        icon: <IconAlertTriangle className="w-6 h-6" />,
        action: 'Ver Tareas Vencidas',
        actionLink: '/tareas?filter=vencidas',
        completed: false,
        priority: 'high'
      });
    }

    // Paso 5: Fomentar Creación de Tareas (si hay docentes pero pocos con tareas)
    if (stats.totalDocentes > 0 && stats.docentesConTareas < stats.totalDocentes && stats.docentesConTareas === 0) {
      steps.push({
        id: 'fomentar_tareas',
        title: 'Fomentar Creación de Tareas',
        description: 'Motiva a los docentes a crear tareas para asegurar el seguimiento del aprendizaje y evaluación continua.',
        icon: <IconClipboard className="w-6 h-6" />,
        action: 'Ver Docentes',
        actionLink: '/docentes?filter=sin_tareas',
        completed: false,
        priority: 'medium'
      });
    }

    // Paso 6: Mejorar Seguimiento (si la tasa de cumplimiento es baja)
    if (stats.tasaCumplimiento < 60 && stats.tareasActivas > 0) {
      steps.push({
        id: 'mejorar_seguimiento',
        title: 'Mejorar Seguimiento Académico',
        description: `La tasa de cumplimiento es del ${stats.tasaCumplimiento}%. Implementa recordatorios y seguimiento para mejorar los resultados.`,
        icon: <IconTrendingUp className="w-6 h-6" />,
        action: 'Ver Estadísticas',
        actionLink: '/reportes/coordinador',
        completed: false,
        priority: 'medium'
      });
    }

    // Paso 7: Configurar Grados (si no hay grados pero hay cursos)
    if (stats.totalGrados === 0 && stats.totalCursos > 0) {
      steps.push({
        id: 'grados',
        title: 'Organizar Estructura de Grados',
        description: 'Configura la estructura de grados para organizar mejor los cursos y el progreso académico.',
        icon: <IconBook className="w-6 h-6" />,
        action: 'Configurar Grados',
        actionLink: '/grados?action=create',
        completed: false,
        priority: 'medium'
      });
    }

    // Paso 8: Generar Reporte (siempre disponible como último paso)
    steps.push({
      id: 'reportes',
      title: 'Generar Reporte Académico',
      description: 'Revisa las estadísticas académicas para monitorear el rendimiento y tomar decisiones informadas.',
      icon: <IconClipboard className="w-6 h-6" />,
      action: 'Ver Reportes',
      actionLink: '/reportes/coordinador',
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
    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-200 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <IconTarget className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-teal-900 mb-1">
              🎯 Guía de Configuración Académica
            </h3>
            <p className="text-sm text-teal-700">
              {institutionName ? `Configurando ${institutionName}` : 'Configurando tu institución'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGuide(false)}
          className="text-teal-400 hover:text-teal-600 transition-colors"
        >
          <IconX className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-teal-600 mb-2">
          <span>Paso {currentStep + 1} de {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% completado</span>
        </div>
        <div className="w-full bg-teal-100 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
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
          className="px-4 py-2 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        <div className="flex gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-teal-600' : 
                index < currentStep ? 'bg-teal-300' : 'bg-teal-100'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-white/60 rounded-lg border border-teal-100">
        <div className="flex items-start gap-2">
          <IconInfo className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-teal-700">
            <p className="font-medium mb-1">💡 Consejo Rápido:</p>
            <p>
              {currentStepData.priority === 'high' && 'Estos pasos son críticos para el funcionamiento básico de la coordinación académica.'}
              {currentStepData.priority === 'medium' && 'Estas acciones mejoran significativamente la gestión académica diaria.'}
              {currentStepData.priority === 'low' && 'Estos son pasos recomendados para optimizar el rendimiento académico.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
