// src/services/db.ts 

import Dexie, { type Table } from 'dexie'; 
// Importamos los tipos para que la base de datos sepa que forma tienen los datos.
import type { Routine, WorkoutDay, Exercise, WorkoutSet } from '../types';

export class KorpusKoachDB extends Dexie {
  // Las propiedades 'routines', 'days', etc., son las "tablas" de nuestra base de datos.
  // La sintaxis `Table<TIPO, CLAVE_PRIMARIA>` le dice a Dexie:
  // 1. Qué forma tienen los objetos de esta tabla (ej. Routine).
  // 2. Cuál es la clave primaria (en nuestro caso, el 'id' que es un string).
  routines!: Table<Routine, string>;
  days!: Table<WorkoutDay, string>;
  exercises!: Table<Exercise, string>;
  sets!: Table<WorkoutSet, string>;
  // Se pueden añadir más tablas aquí a futuro

  constructor() {
    // nombre de la base de datos en IndexedDB
    super('korpusKoachDB');

    // El metodo version().stores() define el esquema de la base de datos.
    this.version(1).stores({
        // Listar las tablas y saber como están indexadas
        routines: 'id, isActive',
        days: 'id',
        exercises: 'id',
        sets: 'id',
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
      // también se puede usar modify() 
      console.log(`Día "${dayName}" añadido a la rutina ${routineId}`);
    } catch (error) { 
      console.error('Error al añadir el día de entrenamiento: ', error);
    }
  }
}

// Se crea una única instancia a la base de datos y se exporta.
// Para que toda la aplicación use la misma conexión a la base de datos (Singleton).
export const db = new KorpusKoachDB(); 
