type ConstantKey =
    | "CATEGORY"
    | "DAYS_OF_WEEK"
    | "EQUIPMENT"
    | "FOCUS_AREA"
    | "FORCE"
    | "INTENSITY_LEVEL"
    | "LANGUAGE"
    | "LEVEL"
    | "MECHANIC"
    | "MUSCLE_GROUP"
    | "SCHEDULE_TYPE"
    | "SET_TYPE"
    | "TARGET_AUDIENCE"
    | "WEIGHT_SELECTION_METHOD";

const CONSTANT_LOCALIZATIONS: Record<
    string,
    Record<ConstantKey, Record<string, string>>
> = {
    en: {
        CATEGORY: {
            STRENGTH: "strength",
            STRETCHING: "stretching",
            CARDIO: "cardio",
            PLYOMETRICS: "plyometrics",
            POWERLIFTING: "powerlifting",
            STRONGMAN: "strongman",
            OLYMPIC_WEIGHTLIFTING: "olympic weightlifting",
        },
        DAYS_OF_WEEK: {
            MONDAY: "monday",
            TUESDAY: "tuesday",
            WEDNESDAY: "wednesday",
            THURSDAY: "thursday",
            FRIDAY: "friday",
            SATURDAY: "saturday",
            SUNDAY: "sunday",
        },
        EQUIPMENT: {
            BODY_ONLY: "body only",
            MACHINE: "machine",
            DUMBBELL: "dumbbell",
            BARBELL: "barbell",
            KETTLEBELLS: "kettlebells",
            BANDS: "bands",
            MEDICINE_BALL: "medicine ball",
            EXERCISE_BALL: "exercise ball",
            CABLE: "cable",
            FOAM_ROLL: "foam roll",
            E_Z_CURL_BAR: "e-z curl bar",
            OTHER: "other",
        },
        FOCUS_AREA: {
            HYPERTROPHY: "hypertrophy",
            FAT_LOSS: "fatLoss",
            STRENGTH: "strength",
            ENDURANCE: "endurance",
        },
        FORCE: {
            PUSH: "push",
            PULL: "pull",
            STATIC: "static",
        },
        INTENSITY_LEVEL: {
            LOW: "low",
            MODERATE: "moderate",
            HIGH: "high",
        },
        LANGUAGE: {
            es: "Español",
            en: "English",
        },
        LEVEL: {
            BEGINNER: "beginner",
            INTERMEDIATE: "intermediate",
            EXPERT: "expert",
        },
        MECHANIC: {
            COMPOUND: "compound",
            ISOLATION: "isolation",
        },
        MUSCLE_GROUP: {
            ABDOMINALS: "abdominals",
            NECK: "neck",
            ADDUCTORS: "adductors",
            ABDUCTORS: "abductors",
            BICEPS: "biceps",
            TRICEPS: "triceps",
            DELTOIDS: "deltoids",
            ERECTOR_SPINAE: "erector spinae",
            GLUTES: "glutes",
            HAMSTRINGS: "hamstrings",
            LATISSIMUS_DORSI: "latissimus dorsi",
            OBLIQUES: "obliques",
            PECTORALS: "pectorals",
            QUADRICEPS: "quadriceps",
            TRAPEZIUS: "trapezius",
            CALVES: "calves",
            FOREARMS: "forearms",
            LOWER_BACK: "lower back",
            MIDDLE_BACK: "middle back",
        },
        SCHEDULE_TYPE: {
            CYCLE: "cycle",
            WEEKLY: "weekly",
        },
        SET_TYPE: {
            SET_PROTOTYPE_STRAIGHT_SET: "Straight Set",
            SET_PROTOTYPE_DROP_SET: "Drop Set",
            SET_PROTOTYPE_SUPER_SET: "Super Set",
        },
        TARGET_AUDIENCE: {
            BEGINNER: "beginner",
            INTERMEDIATE: "intermediate",
            ADVANCED: "advanced",
        },
        WEIGHT_SELECTION_METHOD: {
            REPS_IN_RESERVE: "RIR",
            RATE_OF_PERCEIVED_EXERTION: "RPE",
            PERCENTAGE_OF_1RM: "1RM",
        },
    },
    es: {
        CATEGORY: {
            STRENGTH: "fuerza",
            STRETCHING: "estiramiento",
            CARDIO: "cardio",
            PLYOMETRICS: "pliometría",
            POWERLIFTING: "levantamiento de potencia",
            STRONGMAN: "forzudo",
            OLYMPIC_WEIGHTLIFTING: "levantamiento de pesas olímpico",
        },
        DAYS_OF_WEEK: {
            MONDAY: "lunes",
            TUESDAY: "martes",
            WEDNESDAY: "miércoles",
            THURSDAY: "jueves",
            FRIDAY: "viernes",
            SATURDAY: "sábado",
            SUNDAY: "domingo",
        },
        EQUIPMENT: {
            BODY_ONLY: "solo cuerpo",
            MACHINE: "máquina",
            DUMBBELL: "mancuerna",
            BARBELL: "barra",
            KETTLEBELLS: "pesas rusas",
            BANDS: "bandas",
            MEDICINE_BALL: "balón medicinal",
            EXERCISE_BALL: "pelota de ejercicio",
            CABLE: "polea",
            FOAM_ROLL: "rodillo de espuma",
            E_Z_CURL_BAR: "barra e-z curl",
            OTHER: "otro",
        },
        FOCUS_AREA: {
            HYPERTROPHY: "hipertrofia",
            FAT_LOSS: "pérdida de grasa",
            STRENGTH: "fuerza",
            ENDURANCE: "resistencia",
        },
        FORCE: {
            PUSH: "empuje",
            PULL: "tracción",
            STATIC: "estático",
        },
        INTENSITY_LEVEL: {
            LOW: "baja",
            MODERATE: "moderada",
            HIGH: "alta",
        },
        LANGUAGE: {
            es: "Español",
            en: "Inglés",
        },
        LEVEL: {
            BEGINNER: "principiante",
            INTERMEDIATE: "intermedio",
            EXPERT: "experto",
        },
        MECHANIC: {
            COMPOUND: "compuesto",
            ISOLATION: "aislamiento",
        },
        MUSCLE_GROUP: {
            ABDOMINALS: "abdominales",
            NECK: "cuello",
            ADDUCTORS: "aductores",
            ABDUCTORS: "abductores",
            BICEPS: "bíceps",
            TRICEPS: "tríceps",
            DELTOIDS: "deltoides",
            ERECTOR_SPINAE: "erector de la columna",
            GLUTES: "glúteos",
            HAMSTRINGS: "isquiotibiales",
            LATISSIMUS_DORSI: "dorsal ancho",
            OBLIQUES: "oblicuos",
            PECTORALS: "pectorales",
            QUADRICEPS: "cuádriceps",
            TRAPEZIUS: "trapecios",
            CALVES: "pantorrillas",
            FOREARMS: "antebrazos",
            LOWER_BACK: "zona lumbar",
            MIDDLE_BACK: "zona media de la espalda",
        },
        SCHEDULE_TYPE: {
            CYCLE: "ciclo",
            WEEKLY: "semanal",
        },
        SET_TYPE: {
            SET_PROTOTYPE_STRAIGHT_SET: "serie recta",
            SET_PROTOTYPE_DROP_SET: "superserie",
            SET_PROTOTYPE_SUPER_SET: "serie descendente",
        },
        TARGET_AUDIENCE: {
            BEGINNER: "principiante",
            INTERMEDIATE: "intermedio",
            ADVANCED: "avanzado",
        },
        WEIGHT_SELECTION_METHOD: {
            REPS_IN_RESERVE: "RIR",
            RATE_OF_PERCEIVED_EXERTION: "RPE",
            PERCENTAGE_OF_1RM: "1RM",
        },
    },
};

export default CONSTANT_LOCALIZATIONS;
