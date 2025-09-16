// src/services/db.ts 

import Dexie, { type Table } from 'dexie';
// Importamos los tipos para que la base de datos sepa que forma tienen los datos.
import type { Routine, WorkoutDay, Exercise, ExerciseGroup, WorkoutSet, WorkoutSession, SessionSet, SessionExerciseGroup, BodyWeightEntry } from '../types';

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
  bodyWeights!: Table<BodyWeightEntry, string>;
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
    // Migración de la estructura de rutinas 
    this.version(3).upgrade(tx => {
      // tx.table('routines') da acceso a la tabla para modificarla.
      // .toCollection()modify() nos permite iterar sobre cada rutina guardada. 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tx.table('routines').toCollection().modify((routine: any) => {
        // 'routine' aquí es una rutina con la estructura antigua.
        // Verificamos si tiene la propiedad 'days' y si necesita migración.
        if (routine.days && routine.days.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          routine.days.forEach((day: any) => {
            // Si el día tiene 'exercises' pero no 'groups', necesita migración.
            if (day.exercises && !day.groups) {
              // Se crea la nueva estructura 'groups' 
              // Cada ejercicio antiguo se convierte en un grupo de un solo ejercicio.
              day.groups = day.exercises.map((exercise: Exercise) => ({
                id: crypto.randomUUID(),
                exercises: [exercise],
              }));
              // Se elimina la propiedad antigua para limpiar los datos. 
              delete day.exercises;
            }
          });
        }
      });
    });
    // versión 4: Se añade la tabla de peso corporal 
    this.version(4).stores({
      // Indexado por 'date' para ordenar las entradas cronológicamente de forma eficiente.
      bodyWeights: 'id, date'
    });
    // Nueva versión para modificar la tabla de rutina
    this.version(5).stores({
      routines: 'id, isActive',
      // Se añade 'routineId' a la lista de índices.
      workoutSessions: 'id, status, routineId',
      bodyWeights: 'id, date'
    });
  }

  async addRoutine(name: string) {
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
        groups: [],
      };

      await this.routines.where({ id: routineId }).modify(routine => {
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
      const newGroup: ExerciseGroup = {
        id: crypto.randomUUID(),
        exercises: [newExercise],
      };

      await this.routines.where({ id: routineId }).modify(routine => {
        // Encontramos el día especifico dentro de la rutina 
        const day = routine.days.find(d => d.id === dayId);
        if (day) {
          if (!day.groups) day.groups = []; // groups debe existir
          // Si encontramos el día, le añadimos el nuevo ejercicio 
          day.groups.push(newGroup);
        }
      });
      console.log(`Ejercicio "${exerciseName}" añadido al día ${dayId}`);
    } catch (error) {
      console.error('Error al añadir el ejercicio: ', error);
    }
  }

  async addSetToExercise(routineId: string, dayId: string, exerciseId: string, setData: Omit<WorkoutSet, 'id' | 'completed'>) {
    try {
      const newSet: WorkoutSet = {
        id: crypto.randomUUID(),
        ...setData, // Copia las propiedades de setData (type, reps, weight)
        completed: false,
      };

      await this.routines.where({ id: routineId }).modify(routine => {
        const day = routine.days.find(d => d.id === dayId);
        if (day && day.groups) {
          // Se itera sobre cada grupo para encontrar el ejercicio
          day.groups.forEach(group => {
            const exercise = group.exercises.find(e => e.id === exerciseId);
            if (exercise) {
              // Asegurar que el array de series exista
              if (!exercise.sets) exercise.sets = [];
              exercise.sets.push(newSet);
            }
          });
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

    if (!dayTemplate) throw new Error('Día de entrenamiento no encontrado.');

    const sessionGroups: SessionExerciseGroup[] = (dayTemplate.groups || []).map(group => ({
      ...group,
      exercises: group.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({
          ...set,
          completed: false,
          actualReps: undefined,
          actualWeight: undefined,
          rpe: undefined,
        })),
      })),
    }));

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      status: 'in-progress',
      routineId,
      dayId,
      groups: sessionGroups
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
      if (session.groups) {
        session.groups.forEach(group => {
          const exercise = group.exercises.find(e => e.id === exerciseId);
          if (exercise) {
            const set = exercise.sets.find(s => s.id === setId);
            if (set) {
              // Object.assign() fusiona los cambios de setData en el objeto 'set'
              Object.assign(set, setData);
            }
          }
        });
      }
    });
  }

  async finishWorkoutSession(sessionId: string) {
    // Se usa una transacción para leer la sesión, calcular y luego actualizarla.
    // Esto asegura que la operación sea atómica.
    await this.transaction('rw', this.workoutSessions, async () => {
      const session = await this.workoutSessions.get(sessionId);
      if (!session) return;

      // --- Lógica de cálculo de tonelaje ---
      let totalTonnage = 0;
      session.groups.forEach(group => {
        group.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            if (set.completed && set.actualWeight && set.actualReps) {
              totalTonnage += set.actualWeight * set.actualReps;
            }
          });
        });
      });

      // Se actualiza la sesión con su estado final y los datos calculados.
      await this.workoutSessions.update(sessionId, {
        status: 'completed',
        endTime: new Date(),
        totalTonnage: totalTonnage
      });

      console.log(`Sesión ${sessionId} finalizada con un tonelaje de ${totalTonnage}kg.`);
    });
  }

  // Metodo para modificar la sesión no la plantilla de rutina
  async addSetToSessionExercise(sessionId: string, exerciseId: string) {
    try {
      await this.workoutSessions.where({ id: sessionId }).modify(session => {
        if (session.groups) {
          session.groups.forEach(group => {
            const exercise = group.exercises.find(e => e.id === exerciseId);
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
        }
      });
    } catch (error) {
      console.error('Error al añadir la serie extra: ', error);
    }
  }

  async addBodyWeight(weight: number): Promise<void> {
    const newEntry: BodyWeightEntry = {
      id: crypto.randomUUID(),
      date: new Date(),
      weight: weight,
    };
    await this.bodyWeights.add(newEntry);
    console.log(`Peso corporal ${weight} kg registrado`);
  }

  async getBodyWeightHistory(): Promise<BodyWeightEntry[]> {
    // .orderBy('date') para obtener los datos ya ordenados desde la BD, más eficiente que por js.
    return await this.bodyWeights.orderBy('date').toArray();
  }

  async updateRoutineName(routineId: string, newName: string): Promise<void> {
    await this.routines.update(routineId, { name: newName });
  }

  async deleteRoutine(routineId: string): Promise<void> {
    // Transacción para asegruar que ambas operaciones se completen con éxito o ninguna lo haga (borrar rutina y sus sesiones)
    await this.transaction('rw', this.routines, this.workoutSessions, async () => {
      await this.routines.delete(routineId);
      // Eliminar todas las sesiones de entrenamiento asociadas a esta rutina.
      await this.workoutSessions.where({ routineId }).delete();
    });
  }

  async updateWorkoutDayName(routineId: string, dayId: string, newName: string): Promise<void> {
    await this.routines.where({ id: routineId }).modify(routine => {
      const day = routine.days.find(d => d.id === dayId);
      if (day) {
        day.name = newName;
      }
    });
  }

  async deleteWorkoutDay(routineId: string, dayId: string): Promise<void> {
    await this.routines.where({ id: routineId }).modify(routine => {
      // .filter() crea un nuevo array con todos los días excepto el que se elimina 
      routine.days = routine.days.filter(d => d.id !== dayId);
    })
  }

  async updateExercise(routineId: string, dayId: string, exerciseId: string, updates: Partial<{ name: string; restTime: number }>): Promise<void> {
    await this.routines.where({ id: routineId }).modify(routine => {
      const day = routine.days.find(d => d.id === dayId);
      if (day?.groups) {
        // Se busca el ejercicio en todos los grupos del día 
        day.groups.forEach(group => {
          const exercise = group.exercises.find(e => e.id === exerciseId);
          if (exercise) {
            // Object.assign fusiona los nuevos valores con el objeto existente.
            Object.assign(exercise, updates);
          }
        });
      }
    });
  }

  async deleteExercise(routineId: string, dayId: string, exerciseId: string): Promise<void> {
    await this.routines.where({ id: routineId }).modify(routine => {
      const day = routine.days.find(d => d.id === dayId);
      if (day?.groups) {
        // Se mapea cada grupo filtrando el ejercicio a eliminar su lista interna 
        const updateGroups = day.groups.map(group => ({
          ...group,
          exercises: group.exercises.filter(e => e.id !== exerciseId)
        }));

        // Se filtra de nuevo para eliminar cualquier grupo que haya quedado vacío-
        day.groups = updateGroups.filter(group => group.exercises.length > 0);
      }
    });
  }

  async updateSetInTemplate(routineId: string, dayId: string, exerciseId: string, setId: string, updates: Partial<Omit<WorkoutSet, 'id' | 'completed'>>): Promise<void> {
    await this.routines.where({ id: routineId }).modify(routine => {
      const day = routine.days.find(d => d.id === dayId);
      if (day?.groups) {
        day.groups.forEach(group => {
          const exercise = group.exercises.find(e => e.id === exerciseId);
          if (exercise?.sets) {
            const set = exercise.sets.find(s => s.id === setId);
            if (set) {
              Object.assign(set, updates);
            }
          }
        });
      }
    });
  }

  async deleteSetInTemplate(routineId: string, dayId: string, exerciseId: string, setId: string): Promise<void> {
    await this.routines.where({ id: routineId }).modify(routine => {
      const day = routine.days.find(d => d.id === dayId);
      if (day?.groups) {
        day.groups.forEach(group => {
          const exercise = group.exercises.find(e => e.id === exerciseId);
          if (exercise) {
            exercise.sets = exercise.sets.filter(s => s.id !== setId);
          }
        });
      }
    });
  }

  async updateDayGroups(routineId: string, dayId: string, newGroups: ExerciseGroup[]): Promise<void> {
    await this.routines.where({ id: routineId }).modify(routine => {
      const day = routine.days.find(d => d.id === dayId);
      if (day) {
        day.groups = newGroups;
      }
    });
  }
}

// Se crea una única instancia a la base de datos y se exporta.
// Para que toda la aplicación use la misma conexión a la base de datos (Singleton).
export const db = new KorpusKoachDB(); 
