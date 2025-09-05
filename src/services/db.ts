// src/services/db.ts 

import Dexie, { type Table } from 'dexie'; 
// Importamos los tipos para que la base de datos sepa que forma tienen los datos.
import type { Routine, WorkoutDay, Exercise, WorkoutSet, SetType, WorkoutSession, SessionExercise, SessionSet } from '../types';

export class KorpusKoachDB extends Dexie {
  // Las propiedades 'routines', 'days', etc., son las "tablas" de nuestra base de datos.
  // La sintaxis `Table<TIPO, CLAVE_PRIMARIA>` le dice a Dexie:
  // 1. Qué forma tienen los objetos de esta tabla (ej. Routine).
  // 2. Cuál es la clave primaria (en nuestro caso, el 'id' que es un string).
  routines!: Table<Routine, string>;
  days!: Table<WorkoutDay, string>;
  exercises!: Table<Exercise, string>;
  sets!: Table<WorkoutSet, string>;
  workoutSessions!: Table<WorkoutSession, string>;  
  // Se pueden añadir más tablas aquí a futuro

  constructor() {
    // nombre de la base de datos en IndexedDB
    super('korpusKoachDB');

    // El metodo version().stores() define el esquema de la base de datos.
    this.version(1).stores({
        // Listar las tablas y saber como están indexadas
        routines: 'id, isActive',
    });
    // Se pasa de v1 a v2, Dexie maneja las migraciones
    this.version(2).stores({
      routines: 'id, isActive', 
      workoutSessions: 'id, status' 
    });
  }

  async addRoutine(name:string) {
    try {
      const newRoutine: Routine = {
        id: crypto.randomUUID(), // Genera un ID único universal
        name: name,
        isActive: false, // Las nuevas rutinas no son activas por defecto 
        days: [], // Empieza sin días de entrenamiento
      };

      // Usamos el método 'add' de Dexie para guardar el objeto en la tabla 'routines'.
      // 'await' pausa la ejecución hasta que la operación de guardado se complete.
      await this.routines.add(newRoutine);
      console.log(`Rutina '${name} guardada con éxito.`);
    } catch (error) {
      console.error('Error al guardar la rutina: ', error);
    }
  }

  async getAllRoutines() {
    // .toArray() metodo de Dexie para recuperar los registros de una tabla
    return await this.routines.toArray();
  }

  async getRoutineById(id: string) {
    // metodo get de Dexie super eficiente para buscar por clave primaria.
    return await this.routines.get(id);
  }

  async addWorkoutDayToRoutine(routineId: string, dayName: string) {
    try { 
      const newDay: WorkoutDay = {
        id: crypto.randomUUID(),
        name: dayName,
        exercises: [],
      }; 
      
      await this.routines.where({ id:routineId }).modify(routine => {
        if (!routine.days) {
          routine.days = []; 
        }
        routine.days.push(newDay);
      });
      console.log(`Día "${dayName}" añadido a la rutina ${routineId}`);
    } catch (error) { 
      console.error('Error al añadir el día de entrenamiento: ', error);
    }
  }

  async addExerciseToDay(routineId: string, dayId: string, exerciseName: string) {
    try {
      const newExercise: Exercise = {
        id: crypto.randomUUID(),
        name: exerciseName,
        sets: [], // Los ejercicios empiezan sin series definidas
        restTime: 60, // Tiempo de descanso por defecto
      };

      await this.routines.where({ id: routineId }).modify(routine => {
        // Encontramos el día especifico dentro de la rutina 
        const day = routine.days.find(d => d.id === dayId);
        if (day) {
          // Si encontramos el día, le añadimos el nuevo ejercicio 
          day.exercises.push(newExercise);
        }
      });
      console.log(`Ejercicio "${exerciseName}" añadido al día ${dayId}`);
    } catch (error) {
      console.error('Error al añadir el ejercicio: ', error);
    }
  }
  
  async addSetToExercise(
    routineId: string,
    dayId: string, 
    exerciseId: string,
    setData: Omit<WorkoutSet, 'id' | 'completed'>
  ) { 
    try {
      const newSet: WorkoutSet = {
        id: crypto.randomUUID(),
        ...setData, // Copia las propiedades de setData (type, reps, weight)
        completed: false,
      }; 

      await this.routines.where({ id: routineId }).modify(routine => {
        const day = routine.days.find(d => d.id === dayId);
        if (day) {
          const exercise = day.exercises.find(e => e.id === exerciseId);
          if (exercise) {
            // Asegurar que el array de series exista
            if (!exercise.sets) {
              exercise.sets = [];
            }
            exercise.sets.push(newSet);
          }
        }
      }); 
      console.log(`Serie añadida al ejercicio ${exerciseId}`); 
    } catch (error) {
      console.error('Error al añadir la serie: ', error); 
    } 
  }

  async startWorkoutSession(routineId: string, dayId: string): Promise<string> {
    const routine = await this.routines.get(routineId);
    const dayTemplate = routine?.days.find(d => d.id === dayId);

    if (!dayTemplate) {
      throw new Error('Día de entrenamiento no encontrado.');
    }

    const sessionExercises: SessionExercise[] = dayTemplate.exercises.map(ex => ({ 
      ...ex,
      sets: ex.sets.map(set => ({
        ...set,
        // Inicialmente, los valores 'actuales' están indefinidos 
        actualReps: undefined,
        actualWeight: undefined,
        rpe: undefined,
        completed: false, // Ninguna serie está completada al inicio 
      }))
    })); 

    const newSession: WorkoutSession = { 
      id: crypto.randomUUID(),
      startTime: new Date(),
      status: 'in-progress',
      routineId,
      dayId,
      exercises: sessionExercises,
    };

    await this.workoutSessions.add(newSession);
    return newSession.id; // Devolvemos el ID de la sesión creada
  }

  async getWorkoutSessionById(id: string) {
    return await this.workoutSessions.get(id);
  }

  // Partial<SessionSet> significa que el objeto 'setData' puede tener solo *algunas* de las propiedades de SessionSet
  async updateSessionSet(sessionId: string, exerciseId: string, setId: string, setData: Partial<SessionSet>) {
    await this.workoutSessions.where({ id: sessionId }).modify(session => {
      const exercise = session.exercises.find(e => e.id === exerciseId); 
      if (exercise) {
        const set = exercise.sets.find(s => s.id === setId);
        if (set) {
          // Object.assign() fusiona los cambios de setData en el objeto 'set'
          Object.assign(set, setData);
        }
      }
    });
  }

  async finishWorkoutSession(sessionId: string) {
    // Update solo para cambiar las propiedades que interesan
    await this.workoutSessions.update(sessionId, {
      status: 'completed',
      endTime: new Date(),
    });
    console.log(`Sesión ${sessionId} finalizada`);
  }

  // Metodo para modificar la sesión no la plantilla de rutina
  async addSetToSessionExercise(sessionId: string, exerciseId: string) {
    try {
      await this.workoutSessions.where({ id:sessionId }).modify(session => {
        const exercise = session.exercises.find(e => e.id === exerciseId);
        if (exercise) {
          // La plantilla para la nueva serie, puede copiar la ultima o usar valores por defecto 
          const lastSet = exercise.sets[exercise.sets.length - 1];
          const newSet: SessionSet = {
            id: crypto.randomUUID(),
            type: lastSet?.type || 'Normal', // Copia el tipo de la última serie o usa "Normal"
            reps: lastSet?.reps || 8,
            weight: lastSet?.weight || 0,
            completed: false,
          };
          exercise.sets.push(newSet);
        }
      });
    } catch (error) {
      console.error('Error al añadir la serie extra: ', error);
    }
  }
}

// Se crea una única instancia a la base de datos y se exporta.
// Para que toda la aplicación use la misma conexión a la base de datos (Singleton).
export const db = new KorpusKoachDB(); 
