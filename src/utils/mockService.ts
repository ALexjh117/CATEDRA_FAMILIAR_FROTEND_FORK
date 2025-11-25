type DemoSummary = { parents: number; teachers: number; students: number; tasks: number };

const LS_KEYS = {
  PARENTS: 'demo:parents',
  TEACHERS: 'demo:teachers',
  STUDENTS: 'demo:students',
  TASKS: 'demo:tasks'
}

export function createDemoData(){
  const parents = [
    { id: 'p1', name: 'María López' },
    { id: 'p2', name: 'Carlos Gómez' },
    { id: 'p3', name: 'Ana Ruiz' }
  ];
  const teachers = [
    { id: 't1', name: 'Prof. Ramírez' },
    { id: 't2', name: 'Prof. Medina' }
  ];
  const students = [
    { id: 's1', name: 'Juan' },
    { id: 's2', name: 'Lucía' },
    { id: 's3', name: 'Mateo' }
  ];
  const tasks = [
    { id: 'task1', title: 'Actividad 1', studentId: 's1', submitted: false },
    { id: 'task2', title: 'Actividad 2', studentId: 's2', submitted: true }
  ];

  try{
    localStorage.setItem(LS_KEYS.PARENTS, JSON.stringify(parents));
    localStorage.setItem(LS_KEYS.TEACHERS, JSON.stringify(teachers));
    localStorage.setItem(LS_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(tasks));
  }catch(e){
    console.warn('Could not write demo data to localStorage', e);
  }

  const summary: DemoSummary = { parents: parents.length, teachers: teachers.length, students: students.length, tasks: tasks.length };
  return summary;
}

export function clearDemoData(){
  Object.values(LS_KEYS).forEach(k=>localStorage.removeItem(k));
}

export function readDemoSummary(): DemoSummary{
  try{
    const p = JSON.parse(localStorage.getItem(LS_KEYS.PARENTS) || '[]');
    const t = JSON.parse(localStorage.getItem(LS_KEYS.TEACHERS) || '[]');
    const s = JSON.parse(localStorage.getItem(LS_KEYS.STUDENTS) || '[]');
    const ta = JSON.parse(localStorage.getItem(LS_KEYS.TASKS) || '[]');
    return { parents: p.length, teachers: t.length, students: s.length, tasks: ta.length };
  }catch(e){
    return { parents:0, teachers:0, students:0, tasks:0 };
  }
}

export default { createDemoData, clearDemoData, readDemoSummary };
