import { CensorSensor, CensorTier } from "censor-sensor";
import redisClient from "./redis";

const KEY_PREFIX = "PROFANITY_FILTER";

const censor = new CensorSensor();

censor.addLocale("en", {
    bollocks: CensorTier.PossiblyOffensive,
    dingleberry: CensorTier.PossiblyOffensive,
    dingleberries: CensorTier.PossiblyOffensive,
    douche: CensorTier.PossiblyOffensive,

    anal: CensorTier.SexualTerms,
    anus: CensorTier.SexualTerms,
    bdsm: CensorTier.SexualTerms,
    bestiality: CensorTier.SexualTerms,
    blowjob: CensorTier.SexualTerms,
    bondage: CensorTier.SexualTerms,
    boner: CensorTier.SexualTerms,
    boobs: CensorTier.SexualTerms,
    boob: CensorTier.SexualTerms,
    bukkake: CensorTier.SexualTerms,
    bunghole: CensorTier.SexualTerms,
    butt: CensorTier.SexualTerms,
    circlejerk: CensorTier.SexualTerms,
    clit: CensorTier.SexualTerms,
    clitoris: CensorTier.SexualTerms,
    cocks: CensorTier.SexualTerms,
    cock: CensorTier.SexualTerms,
    creampie: CensorTier.SexualTerms,
    cum: CensorTier.SexualTerms,
    cumming: CensorTier.SexualTerms,
    deepthroat: CensorTier.SexualTerms,
    dick: CensorTier.SexualTerms,
    dildo: CensorTier.SexualTerms,
    dominatrix: CensorTier.SexualTerms,
    dommes: CensorTier.SexualTerms,
    domme: CensorTier.SexualTerms,
    ecchi: CensorTier.SexualTerms,
    ejaculation: CensorTier.SexualTerms,
    erotic: CensorTier.SexualTerms,
    fellatio: CensorTier.SexualTerms,
    femdom: CensorTier.SexualTerms,
    fetish: CensorTier.SexualTerms,
    fingerbang: CensorTier.SexualTerms,
    futanari: CensorTier.SexualTerms,
    genitals: CensorTier.SexualTerms,
    grope: CensorTier.SexualTerms,
    "g-spot": CensorTier.SexualTerms,
    handjob: CensorTier.SexualTerms,
    hentai: CensorTier.SexualTerms,
    homoerotic: CensorTier.SexualTerms,
    humping: CensorTier.SexualTerms,
    incest: CensorTier.SexualTerms,
    intercourse: CensorTier.SexualTerms,
    jailbait: CensorTier.SexualTerms,
    jizz: CensorTier.SexualTerms,
    kinkster: CensorTier.SexualTerms,
    kinky: CensorTier.SexualTerms,
    masturbate: CensorTier.SexualTerms,
    masturbation: CensorTier.SexualTerms,
    milf: CensorTier.SexualTerms,
    nipples: CensorTier.SexualTerms,
    nipple: CensorTier.SexualTerms,
    nude: CensorTier.SexualTerms,
    nudity: CensorTier.SexualTerms,
    nympho: CensorTier.SexualTerms,
    nymphomaniac: CensorTier.SexualTerms,
    orgasm: CensorTier.SexualTerms,
    orgy: CensorTier.SexualTerms,
    pedobear: CensorTier.SexualTerms,
    pedophile: CensorTier.SexualTerms,
    paedophile: CensorTier.SexualTerms,
    panty: CensorTier.SexualTerms,
    panties: CensorTier.SexualTerms,
    pegging: CensorTier.SexualTerms,
    penis: CensorTier.SexualTerms,
    playboy: CensorTier.SexualTerms,
    poon: CensorTier.SexualTerms,
    porn: CensorTier.SexualTerms,
    pubes: CensorTier.SexualTerms,
    pussy: CensorTier.SexualTerms,
    queef: CensorTier.SexualTerms,
    queaf: CensorTier.SexualTerms,
    rape: CensorTier.SexualTerms,
    raping: CensorTier.SexualTerms,
    rapist: CensorTier.SexualTerms,
    rectum: CensorTier.SexualTerms,
    scat: CensorTier.SexualTerms,
    schlong: CensorTier.SexualTerms,
    semen: CensorTier.SexualTerms,
    sex: CensorTier.SexualTerms,
    sexy: CensorTier.SexualTerms,
    skeet: CensorTier.SexualTerms,
    sodomize: CensorTier.SexualTerms,
    sodomy: CensorTier.SexualTerms,
    spooge: CensorTier.SexualTerms,
    splooge: CensorTier.SexualTerms,
    spunk: CensorTier.SexualTerms,
    swinger: CensorTier.SexualTerms,
    threesome: CensorTier.SexualTerms,
    titties: CensorTier.SexualTerms,
    titty: CensorTier.SexualTerms,
    tits: CensorTier.SexualTerms,
    tit: CensorTier.SexualTerms,
    tosser: CensorTier.SexualTerms,
    tubgirl: CensorTier.SexualTerms,
    twat: CensorTier.SexualTerms,
    upskirt: CensorTier.SexualTerms,
    vagina: CensorTier.SexualTerms,
    vibrator: CensorTier.SexualTerms,
    voyeur: CensorTier.SexualTerms,
    vulva: CensorTier.SexualTerms,
    wank: CensorTier.SexualTerms,
    yaoi: CensorTier.SexualTerms,
    yuri: CensorTier.SexualTerms,

    arsehole: CensorTier.CommonProfanity,
    arse: CensorTier.CommonProfanity,
    asshole: CensorTier.CommonProfanity,
    assface: CensorTier.CommonProfanity,
    asshat: CensorTier.CommonProfanity,
    ass: CensorTier.CommonProfanity,
    bastards: CensorTier.CommonProfanity,
    bastard: CensorTier.CommonProfanity,
    bitching: CensorTier.CommonProfanity,
    bitchin: CensorTier.CommonProfanity,
    bitches: CensorTier.CommonProfanity,
    bitch: CensorTier.CommonProfanity,
    bullshit: CensorTier.CommonProfanity,
    damnit: CensorTier.CommonProfanity,
    damn: CensorTier.CommonProfanity,
    fucktards: CensorTier.CommonProfanity,
    fucktard: CensorTier.CommonProfanity,
    fucking: CensorTier.CommonProfanity,
    fuckers: CensorTier.CommonProfanity,
    fucker: CensorTier.CommonProfanity,
    fuck: CensorTier.CommonProfanity,
    "god damn": CensorTier.CommonProfanity,
    goddamn: CensorTier.CommonProfanity,
    hell: CensorTier.CommonProfanity,
    motherfucker: CensorTier.CommonProfanity,
    pissing: CensorTier.CommonProfanity,
    pissed: CensorTier.CommonProfanity,
    piss: CensorTier.CommonProfanity,
    shitter: CensorTier.CommonProfanity,
    shitty: CensorTier.CommonProfanity,
    shit: CensorTier.CommonProfanity,

    beaners: CensorTier.Slurs,
    beaner: CensorTier.Slurs,
    bimbo: CensorTier.Slurs,
    coon: CensorTier.Slurs,
    coons: CensorTier.Slurs,
    cunt: CensorTier.Slurs,
    cunts: CensorTier.Slurs,
    darkie: CensorTier.Slurs,
    darkies: CensorTier.Slurs,
    fag: CensorTier.Slurs,
    fags: CensorTier.Slurs,
    faggot: CensorTier.Slurs,
    faggots: CensorTier.Slurs,
    hooker: CensorTier.Slurs,
    kike: CensorTier.Slurs,
    kikes: CensorTier.Slurs,
    nazi: CensorTier.Slurs,
    nazis: CensorTier.Slurs,
    neonazi: CensorTier.Slurs,
    neonazis: CensorTier.Slurs,
    negro: CensorTier.Slurs,
    negros: CensorTier.Slurs,
    nigga: CensorTier.Slurs,
    niggas: CensorTier.Slurs,
    nigger: CensorTier.Slurs,
    niggers: CensorTier.Slurs,
    paki: CensorTier.Slurs,
    pakis: CensorTier.Slurs,
    raghead: CensorTier.Slurs,
    ragheads: CensorTier.Slurs,
    shemale: CensorTier.Slurs,
    shemales: CensorTier.Slurs,
    slut: CensorTier.Slurs,
    sluts: CensorTier.Slurs,
    spic: CensorTier.Slurs,
    spics: CensorTier.Slurs,
    swastika: CensorTier.Slurs,
    towelhead: CensorTier.Slurs,
    towelheads: CensorTier.Slurs,
    tranny: CensorTier.Slurs,
    trannys: CensorTier.Slurs,
    trannies: CensorTier.Slurs,
    twink: CensorTier.Slurs,
    twinks: CensorTier.Slurs,
    wetback: CensorTier.Slurs,
    wetbacks: CensorTier.Slurs,
});

// Define profanity for each locale s.t. locale != en
censor.addLocale("es", {
    // **Slurs** (Highly offensive, used as insults against groups or individuals)
    maricón: CensorTier.Slurs, // Offensive slur for a gay man
    sudaca: CensorTier.Slurs, // Racist slur for South Americans in Spain
    cholo: CensorTier.Slurs, // Can be used as a racial slur in some countries (Peru, Bolivia, Ecuador)
    indio: CensorTier.Slurs, // Used as a derogatory term against indigenous people
    guarro: CensorTier.Slurs, // Spain: Can mean "dirty" or an insult for a filthy person
    gringo: CensorTier.Slurs, // Latin America: Derogatory term for Americans/foreigners
    mono: CensorTier.Slurs, // South America: Racist insult comparing people to monkeys
    gitano: CensorTier.Slurs, // Spain: Can be used pejoratively against Romani people
    godo: CensorTier.Slurs, // Venezuela: Pejorative term for Spanish people
    argolla: CensorTier.Slurs, // Peru: Used as a class-based insult for elites
    cani: CensorTier.Slurs, // Spain: Used pejoratively for delinquents or low-class people
    facha: CensorTier.Slurs, // Spain & Latin America: Insult for fascists or right-wing people
    mocho: CensorTier.Slurs, // Mexico: Derogatory term for ultra-religious conservatives
    pajero: CensorTier.Slurs, // Argentina & Uruguay: "Wanker" or "lazy person"
    pastuzo: CensorTier.Slurs, // Colombia: Offensive term for people from Pasto
    serrano: CensorTier.Slurs, // Peru, Bolivia: Derogatory term for highland indigenous people

    // **Sexual Terms** (Words directly referring to sexual activity or anatomy)
    follar: CensorTier.SexualTerms, // Equivalent to "fuck" in Spain
    coger: CensorTier.SexualTerms, // In Spain means "to grab," but in Latin America, it means "to have sex"
    mamada: CensorTier.SexualTerms, // Refers to oral sex ("blowjob")
    chupar: CensorTier.SexualTerms, // Can mean "suck" but often has sexual connotations
    verga: CensorTier.SexualTerms, // Vulgar slang for "penis"
    polla: CensorTier.SexualTerms, // Vulgar term for "penis" in Spain
    chingar: CensorTier.SexualTerms, // Mexico: "To fuck"
    culear: CensorTier.SexualTerms, // Colombia, Argentina, Chile: "To have sex"
    empujar: CensorTier.SexualTerms, // Some countries use this as slang for intercourse
    calzón: CensorTier.SexualTerms, // Some countries use it as slang for women's underwear
    almeja: CensorTier.SexualTerms, // "Clam" (vulgar slang for female genitalia)
    cuca: CensorTier.SexualTerms, // Latin America: Vulgar slang for vagina
    jinetera: CensorTier.SexualTerms, // Cuba: Slang for a prostitute
    capullo: CensorTier.SexualTerms, // Spain: Can mean "dick" or "jerk"
    lechazo: CensorTier.SexualTerms, // Spain & Latin America: "Cumshot"
    pollón: CensorTier.SexualTerms, // "Big dick" (Spain)
    mecánico: CensorTier.SexualTerms, // Slang for male gigolo (Mexico)

    // **Common Profanity** (General curse words, not extreme but widely recognized as offensive)
    mierda: CensorTier.CommonProfanity, // Equivalent to "shit"
    carajo: CensorTier.CommonProfanity, // Often used as "damn" or "fuck"
    joder: CensorTier.CommonProfanity, // Similar to "fuck" but commonly used like "damn"
    cabrón: CensorTier.CommonProfanity, // Strong insult, similar to "bastard"
    pendejo: CensorTier.CommonProfanity, // Means "idiot" or "asshole" in Latin America
    gilipollas: CensorTier.CommonProfanity, // Strong insult in Spain, meaning "dumbass" or "moron"
    puto: CensorTier.CommonProfanity, // Often used as an insult like "bastard" (but also a slur in some contexts)
    puta: CensorTier.CommonProfanity, // Derogatory term for "prostitute" or "bitch"
    hostia: CensorTier.CommonProfanity, // Spain: Strong expletive like "damn" or "holy shit"
    coño: CensorTier.CommonProfanity, // Repeated because it has multiple meanings (Expletive & Sexual)
    hijueputa: CensorTier.CommonProfanity, // Colombia, Central America: Strong insult like "son of a bitch"
    jodido: CensorTier.CommonProfanity, // "Screwed" or "fucked up"
    cagada: CensorTier.CommonProfanity, // "Screw-up" or "shit situation"
    chingada: CensorTier.CommonProfanity, // Mexico: "Screwed" or "fucked up"
    cojones: CensorTier.CommonProfanity, // Spain: "Balls" (as in bravery, but vulgar)
    cabreado: CensorTier.CommonProfanity, // Spain: Equivalent to "pissed off"
    caradura: CensorTier.CommonProfanity, // Spain & Argentina: "Shameless" or "scammer"
    huevón: CensorTier.CommonProfanity, // Latin America: "Dumbass" or "lazy"
    pelotudo: CensorTier.CommonProfanity, // Argentina, Uruguay: Similar to "idiot" or "jackass"
    cagón: CensorTier.CommonProfanity, // Latin America: "Coward" or "scared shitless"
    cabrilla: CensorTier.CommonProfanity, // Spain: Variation of "cabrón"
    hostias: CensorTier.CommonProfanity, // Spain: Expression of surprise or anger
    vergazo: CensorTier.CommonProfanity, // Latin America: Intensifier, similar to "a hell of a hit"
    gilipuertas: CensorTier.CommonProfanity, // Softer variation of "gilipollas"
    pinche: CensorTier.CommonProfanity, // "Fucking" (as an intensifier)
    culero: CensorTier.CommonProfanity, // "Asshole"
    verguenza: CensorTier.CommonProfanity, // Stronger vulgar variation of "verga"

    // **Possibly Offensive** (Words that can be offensive in certain contexts but are milder than full profanity)
    idiota: CensorTier.PossiblyOffensive, // "Idiot"
    petardo: CensorTier.PossiblyOffensive, // Spain: Can refer to someone as "ugly" or "bad in bed"
    imbécil: CensorTier.PossiblyOffensive, // "Imbecile"
    estúpido: CensorTier.PossiblyOffensive, // "Stupid"
    bastardo: CensorTier.PossiblyOffensive, // "Bastard"
    tonto: CensorTier.PossiblyOffensive, // "Fool" or "dummy"
    tarado: CensorTier.PossiblyOffensive, // "Moron" or "dumb"
    retrasado: CensorTier.PossiblyOffensive, // "Retarded" (very offensive in modern use)
    zoquete: CensorTier.PossiblyOffensive, // "Blockhead" or "dumb person"
    patán: CensorTier.PossiblyOffensive, // "Brute" or "uncultured person"
    bruto: CensorTier.PossiblyOffensive, // "Dumb" or "rough"
    vago: CensorTier.PossiblyOffensive, // "Lazy person"
    ganso: CensorTier.PossiblyOffensive, // "Fool" (used in some regions)
    baboso: CensorTier.PossiblyOffensive, // "Drooling idiot" or "pervert"
    papanatas: CensorTier.PossiblyOffensive, // Spain: "Naive fool"
    zopenco: CensorTier.PossiblyOffensive, // "Blockhead" or "stupid"
    atontado: CensorTier.PossiblyOffensive, // "Slow-witted" or "dim"
    chafa: CensorTier.PossiblyOffensive, // Mexico: "Cheap" or "crappy"
    choto: CensorTier.PossiblyOffensive, // Argentina, Uruguay: "Cheap" or "worthless"
    comemierda: CensorTier.PossiblyOffensive, // Latin America: "Arrogant" or "useless person"
    gil: CensorTier.PossiblyOffensive, // Argentina: "Idiot" or "fool"
    pelmazo: CensorTier.PossiblyOffensive, // Spain: "Annoying idiot"
    naco: CensorTier.PossiblyOffensive, // Insult for low-class people
    güey: CensorTier.PossiblyOffensive, // Can mean "dumbass" or "dude" depending on context
    matao: CensorTier.PossiblyOffensive, // Spain: "Worthless idiot"
    pringado: CensorTier.PossiblyOffensive, // Spain: "Loser"
});

// Custom clean function to mask profanity
censor.setCleanFunction((str) => {
    if (str.length > 3) {
        const start = str.slice(0, 1);
        const middle = str.slice(1, -1);
        const end = str.slice(-1);

        return start + "*".repeat(middle.length) + end;
    }
    return "*".repeat(str.length);
});

/**
 * Censors profanity in the given text, stores the result in a Redis cache
 * with the given key, and returns the censored text.
 *
 * If the given key is already present in the cache, this function will
 * return the cached value without re-censoring the text.
 *
 * The cache is set to expire after 1 hour.
 *
 * @param text The text to censor
 * @param key The key to store the censored text under in the cache
 * @param locale The locale to use for censoring
 * @returns The censored text
 */
export const censorText = async (text: string, key: string, locale: string) => {
    const value = await redisClient.get(`${KEY_PREFIX}:${key}`);

    // *** If value is cached, return it ***
    if (value) {
        return value;
    }

    if (!text) {
        return "";
    }

    censor.setLocale(locale);
    const censoredText = censor.cleanProfanity(text);

    // *** Cache result ***
    await redisClient.set(`${KEY_PREFIX}:${key}`, censoredText, {
        EX: 3600,
    });

    return censoredText;
};

/**
 * Deletes the cached censored text for the given key.
 * @param key The key to delete the cached text for.
 */
export const deleteCachedCensoredText = async (key: string) => {
    await redisClient.del(`${KEY_PREFIX}:${key}`);
};

/**
 * Deletes multiple cached censored text items from Redis in a single operation.
 *
 * @param keys The keys to delete the cached text for.
 */
export const batchDeleteCachedCensoredText = async (keys: string[]) => {
    if (keys.length === 0) return;

    const fullKeys = keys.map((key) => `${KEY_PREFIX}:${key}`);
    const pipeline = redisClient.multi();

    fullKeys.forEach((fullKey) => pipeline.del(fullKey));

    await pipeline.exec();
};

/**
 * Sets the tiers to be accepted by the profanity filter.
 * The profanity filter will enable all tiers, and then disable
 * the given tiers.
 *
 * @param acceptedTiers The tiers to be accepted by the profanity filter.
 */
export const setCensorTiers = (acceptedTiers: CensorTier[]) => {
    // *** Enable all tiers ***
    Object.values(CensorTier).forEach((tier) =>
        censor.enableTier(tier as CensorTier),
    );

    // *** Disable the given tiers ***
    acceptedTiers.forEach((tier) => censor.disableTier(tier));
};
