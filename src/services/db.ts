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
}

// Se crea una única instancia a la base de datos y se exporta.
// Para que toda la aplicación use la misma conexión a la base de datos (Singleton).
export const db = new KorpusKoachDB(); 
