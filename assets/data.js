/* Contenido de la Parte 2 de Common Criteria v3.1 (SFR).
   Fuentes: recurso_h5p_common_criteria_parte2.md + "CC v3.1 SFRs: Classes and Families" (atsec). */

const f = (code, name, en, desc) => ({ code, name, en, desc });

const CLASSES = [
  {
    code: "FAU", name: "Auditoría de seguridad", en: "Security audit",
    protects: "Trazabilidad y detección de eventos",
    mnemonic: "Auditar", icon: "report",
    keywords: ["Registro", "Evento", "Alarma"],
    concept: {
      q: "¿Qué clase registra y analiza los eventos de seguridad?",
      a: "Auditoría de seguridad. Es la base de la trazabilidad y de la respuesta ante incidentes."
    },
    families: [
      f("ARP", "Respuesta automática", "Security audit automatic response", "Detecta eventos sospechosos y dispara una acción automática, como bloquear una cuenta."),
      f("GEN", "Generación de datos", "Security audit data generation", "Registra los eventos de seguridad definidos: quién, cuándo y qué ocurrió."),
      f("SAA", "Análisis de auditoría", "Security audit analysis", "Analiza los registros para detectar patrones de ataque o comportamientos anómalos."),
      f("SAR", "Revisión de auditoría", "Security audit review", "Permite al auditor consultar los registros a través de una interfaz de revisión."),
      f("SEL", "Selección de eventos", "Security audit event selection", "Decide qué eventos se registran según criterios configurables."),
      f("STG", "Almacenamiento de auditoría", "Security audit event storage", "Protege los registros frente a pérdida, modificación o llenado del almacén.")
    ]
  },
  {
    code: "FCO", name: "Comunicación", en: "Communication",
    protects: "No repudio en el intercambio de datos",
    mnemonic: "Dar prueba", icon: "mail-check",
    keywords: ["Firma", "Prueba de origen", "Prueba de recepción"],
    concept: {
      q: "¿Qué clase evita que alguien niegue haber enviado o recibido información?",
      a: "Comunicación. Genera evidencia verificable del origen y de la recepción de los datos."
    },
    families: [
      f("NRO", "No repudio de origen", "Non-repudiation of origin", "Demuestra que un sujeto envió un mensaje y genera prueba de origen."),
      f("NRR", "No repudio de recepción", "Non-repudiation of receipt", "Demuestra que el destinatario recibió el mensaje y genera prueba de entrega.")
    ]
  },
  {
    code: "FCS", name: "Soporte criptográfico", en: "Cryptographic support",
    protects: "Uso correcto de la criptografía",
    mnemonic: "Cifrar bien", icon: "key",
    keywords: ["Clave", "Cifrado", "Algoritmo"],
    concept: {
      q: "¿Qué clase regula la gestión de claves y las operaciones de cifrado?",
      a: "Soporte criptográfico. Cubre el ciclo de vida de las claves y el uso de operaciones criptográficas aprobadas."
    },
    families: [
      f("CKM", "Gestión de claves", "Cryptographic key management", "Cubre generación, distribución, almacenamiento, acceso, uso y destrucción de claves."),
      f("COP", "Operación criptográfica", "Cryptographic operation", "Ejecuta cifrado, firma o hash con algoritmos, claves y parámetros aprobados.")
    ]
  },
  {
    code: "FDP", name: "Protección de datos de usuario", en: "User data protection",
    protects: "Confidencialidad e integridad de los datos",
    mnemonic: "Proteger datos", icon: "database",
    keywords: ["Control de acceso", "Flujo", "Residual"],
    concept: {
      q: "¿Qué clase controla el acceso y el flujo de información sobre datos de usuario?",
      a: "Protección de datos de usuario. Regula quién puede leer o modificar datos y cómo se transferen."
    },
    families: [
      f("ACC", "Política de control de acceso", "Access control policy", "Define quién puede acceder a qué objetos y bajo qué condiciones."),
      f("ACF", "Funciones de control de acceso", "Access control functions", "Aplica la política y permite o deniega operaciones concretas sobre objetos."),
      f("DAU", "Autenticación de datos", "Data authentication", "Permite verificar el origen y la integridad de un dato, por ejemplo con firma digital."),
      f("ETC", "Exportación desde el TOE", "Export from the TOE", "Controla qué datos salen del TOE y cómo se protegen durante la transferencia."),
      f("IFC", "Política de control de flujo", "Information flow control policy", "Define reglas de flujo entre sujetos y objetos, por ejemplo modelo Bell-LaPadula."),
      f("IFF", "Funciones de control de flujo", "Information flow control functions", "Aplica la política de flujo y decide si un intercambio está permitido."),
      f("ITC", "Importación al TOE", "Import from outside of the TOE", "Controla la entrada de datos externos y comprueba su fiabilidad antes de importarlos."),
      f("ITT", "Transferencia interna", "Internal TOE transfer", "Protege los datos de usuario transferidos entre partes internas del TOE."),
      f("RIP", "Información residual", "Residual information protection", "Impide recuperar datos borrados de memoria o almacenamiento ya reasignado."),
      f("ROL", "Reversión", "Rollback", "Permite deshacer operaciones y recuperar un estado anterior coherente."),
      f("SDI", "Integridad de datos almacenados", "Stored data integrity", "Detecta modificaciones no autorizadas en datos almacenados."),
      f("UCT", "Confidencialidad en transferencia", "Inter-TSF user data confidentiality transfer protection", "Protege la confidencialidad de datos de usuario enviados entre TOEs."),
      f("UIT", "Integridad en transferencia", "Inter-TSF user data integrity transfer protection", "Detecta alteración, pérdida o repetición de datos transferidos entre TOEs.")
    ]
  },
  {
    code: "FIA", name: "Identificación y autenticación", en: "Identification and authentication",
    protects: "Saber quién es el usuario",
    mnemonic: "Identificar", icon: "user-check",
    keywords: ["Contraseña", "Token", "ID"],
    concept: {
      q: "¿Qué clase verifica la identidad y limita los intentos fallidos?",
      a: "Identificación y autenticación. Establece quién es el usuario y comprueba que realmente lo es."
    },
    families: [
      f("AFL", "Fallos de autenticación", "Authentication failures", "Define el umbral de intentos fallidos y la acción asociada: bloqueo, retardo o alarma."),
      f("ATD", "Atributos de usuario", "User attribute definition", "Establece los atributos de seguridad asociados a cada usuario."),
      f("SOS", "Especificación de secretos", "Specification of secrets", "Define requisitos de calidad de secretos: longitud, entropía y caducidad."),
      f("UAU", "Autenticación de usuario", "User authentication", "Verifica la identidad declarada mediante contraseña, biometría o token."),
      f("UID", "Identificación de usuario", "User identification", "Establece quién es el usuario antes de verificar su identidad."),
      f("USB", "Vinculación usuario-sujeto", "User-subject binding", "Asocia cada sujeto del TSF con el usuario autenticado que actúa en su nombre.")
    ]
  },
  {
    code: "FMT", name: "Gestión de seguridad", en: "Security management",
    protects: "Administración de atributos, roles y funciones",
    mnemonic: "Administrar", icon: "settings",
    keywords: ["Rol", "Atributo", "Revocación"],
    concept: {
      q: "¿Qué clase define quién puede administrar y cambiar la seguridad?",
      a: "Gestión de seguridad. Determina qué roles pueden modificar funciones, atributos y datos del TSF."
    },
    families: [
      f("MOF", "Gestión de funciones", "Management of functions in TSF", "Controla quién puede activar, desactivar o modificar funciones de seguridad."),
      f("MSA", "Gestión de atributos", "Management of security attributes", "Controla quién puede crear, modificar o eliminar atributos de seguridad."),
      f("MTD", "Gestión de datos del TSF", "Management of TSF data", "Controla la gestión de datos internos del TSF: umbrales, listas y parámetros."),
      f("REV", "Revocación", "Revocation", "Permite retirar permisos o credenciales a usuarios o sujetos."),
      f("SAE", "Caducidad de atributos", "Security attribute expiration", "Establece cuándo dejan de ser válidos determinados atributos."),
      f("SMF", "Especificación de gestión", "Specification of management functions", "Declara qué funciones de gestión están disponibles en el TOE."),
      f("SMR", "Roles de gestión", "Security management roles", "Define roles, como administrador o auditor, y sus responsabilidades.")
    ]
  },
  {
    code: "FPR", name: "Privacidad", en: "Privacy",
    protects: "Anonimato y no vinculación",
    mnemonic: "Ocultar rastro", icon: "eye-off",
    keywords: ["Seudónimo", "Anonimato", "No vinculación"],
    concept: {
      q: "¿Qué clase protege al usuario de ser identificado o rastreado?",
      a: "Privacidad. Limita la identificación, la vinculación y la observabilidad de las acciones del usuario."
    },
    families: [
      f("ANO", "Anonimato", "Anonymity", "Impide identificar al usuario dentro de un conjunto de sujetos."),
      f("PSE", "Seudonimia", "Pseudonymity", "Sustituye la identidad real por un seudónimo, con vinculación controlada."),
      f("UNL", "No vinculación", "Unlinkability", "Impide correlacionar operaciones o identidades del mismo usuario."),
      f("UNO", "No observabilidad", "Unobservability", "Impide que un observador determine si una operación ha tenido lugar.")
    ]
  },
  {
    code: "FPT", name: "Protección de las TSF", en: "Protection of the TSF",
    protects: "Integridad y fiabilidad del mecanismo de seguridad",
    mnemonic: "Proteger al protector", icon: "shield-check",
    keywords: ["Tamper", "Recuperación", "Autoprueba"],
    concept: {
      q: "¿Qué clase protege los mecanismos de seguridad del propio TOE?",
      a: "Protección de las TSF. Vigila que el motor de seguridad no sea manipulado, alterado o puesto en peligro."
    },
    families: [
      f("EMS", "Emanaciones del TOE", "Emanations of TOE security functions", "Limita la fuga de información por emanaciones electromagnéticas o canales laterales."),
      f("FLS", "Fallo seguro", "Fail secure", "Si el TOE falla, permanece en un estado seguro en lugar de degradar la seguridad."),
      f("ITA", "Disponibilidad de datos exportados", "Availability of exported TSF data", "Garantiza que los datos TSF enviados a otra entidad sigan disponibles."),
      f("ITC", "Confidencialidad de datos exportados", "Confidentiality of exported TSF data", "Protege la confidencialidad de los datos TSF transferidos a otra entidad."),
      f("ITI", "Integridad de datos exportados", "Integrity of exported TSF data", "Detecta modificaciones no autorizadas de datos TSF transferidos."),
      f("ITT", "Transferencia interna de TSF", "Internal TOE TSF data transfer", "Protege la transferencia de datos TSF entre componentes internos del TOE."),
      f("PHP", "Protección física", "TSF physical protection", "Detecta y responde ante la manipulación física o la extracción del TOE."),
      f("RCV", "Recuperación fiable", "Trusted recovery", "Permite volver a un estado seguro tras una falla o interrupción."),
      f("RPL", "Detección de repetición", "Replay detection", "Detecta y rechaza mensajes o comandos repetidos."),
      f("SSP", "Sincronía de estados", "State synchrony protocol", "Mantiene sincronizados los estados de seguridad entre componentes del TSF."),
      f("STM", "Sellos de tiempo", "Time stamps", "Proporciona marcas de tiempo fiables para eventos y datos."),
      f("TDC", "Consistencia entre TSFs", "Inter-TSF TSF data consistency", "Asegura que los datos TSF interpretados por distintas entidades sean consistentes."),
      f("TEE", "Prueba de entidades externas", "Testing of external entities", "Comprueba que una entidad externa cumple los requisitos de seguridad esperados."),
      f("TRC", "Consistencia de replicación", "Internal TOE TSF data replication consistency", "Mantiene coherentes las copias internas de datos TSF dentro del TOE."),
      f("TST", "Autoprueba del TSF", "TSF self test", "Ejecuta pruebas de integridad y correcto funcionamiento en arranque o bajo demanda.")
    ]
  },
  {
    code: "FRU", name: "Utilización de recursos", en: "Resource utilisation",
    protects: "Disponibilidad y tolerancia a fallos",
    mnemonic: "Repartir recursos", icon: "cpu",
    keywords: ["Cuota", "Prioridad", "Tolerancia a fallos"],
    concept: {
      q: "¿Qué clase asegura que los recursos estén disponibles ante fallos o abuso?",
      a: "Utilización de recursos. Gestiona prioridades, cuotas y tolerancia a fallos para sostener el servicio."
    },
    families: [
      f("FLT", "Tolerancia a fallos", "Fault tolerance", "Mantiene el servicio ante fallos de componentes con degradación controlada."),
      f("PRS", "Prioridad de servicio", "Priority of service", "Asigna prioridades para que usuarios o tareas críticas reciban recursos primero."),
      f("RSA", "Asignación de recursos", "Resource allocation", "Limita cuotas de memoria, CPU o conexiones por usuario o sujeto.")
    ]
  },
  {
    code: "FTA", name: "Acceso al TOE", en: "TOE access",
    protects: "Control de sesiones",
    mnemonic: "Gobernar la sesión", icon: "clock",
    keywords: ["Sesión", "Bloqueo", "Banner"],
    concept: {
      q: "¿Qué clase gestiona avisos, bloqueo y límites de sesión?",
      a: "Acceso al TOE. Controla cómo se establece, se muestra y se cierra una sesión de usuario."
    },
    families: [
      f("LSA", "Ámbito de atributos", "Limitation on scope of selectable attributes", "Restringe qué atributos puede seleccionar el usuario al iniciar sesión."),
      f("MCS", "Sesiones concurrentes", "Limitation on multiple concurrent sessions", "Limita el número de sesiones simultáneas de un mismo usuario."),
      f("SSL", "Bloqueo de sesión", "Session locking", "Bloquea o termina una sesión tras inactividad o por petición del usuario."),
      f("TAB", "Banners de acceso", "TOE access banners", "Muestra un aviso legal o informativo antes de establecer la sesión."),
      f("TAH", "Historial de acceso", "TOE access history", "Muestra al usuario la fecha, hora y método de su último acceso."),
      f("TSE", "Establecimiento de sesión", "TOE session establishment", "Controla cuándo puede establecerse una sesión según horario, ubicación o estado.")
    ]
  },
  {
    code: "FTP", name: "Rutas y canales de confianza", en: "Trusted path/channels",
    protects: "Comunicación segura con el TOE",
    mnemonic: "Canal seguro", icon: "route",
    keywords: ["Canal", "Ruta de confianza", "Autenticación mutua"],
    concept: {
      q: "¿Qué clase garantiza canales y rutas seguras hacia el TOE?",
      a: "Rutas y canales de confianza. Asegura que la comunicación con el TOE no pueda ser suplantada ni interceptada."
    },
    families: [
      f("ITC", "Canal de confianza", "Inter-TSF trusted channel", "Canal autenticado y protegido entre el TOE y otra entidad de confianza."),
      f("TRP", "Ruta de confianza", "Trusted path", "Canal directo y protegido entre el usuario y el TSF, sin intermediarios no fiables.")
    ]
  }
];

const SCENARIOS = [
  { text: "El sistema no registra los intentos fallidos de inicio de sesión.", cls: "FAU", fam: "GEN", feedback: "Se vulnera FAU_GEN: el TOE no genera datos de auditoría para un evento de seguridad relevante." },
  { text: "Un atacante prueba contraseñas sin límite y nunca se bloquea la cuenta.", cls: "FIA", fam: "AFL", feedback: "Se vulnera FIA_AFL: el TOE no define un umbral de intentos fallidos ni una acción ante el fallo." },
  { text: "Un usuario niega haber enviado una orden de pago y no hay evidencia.", cls: "FCO", fam: "NRO", feedback: "Se vulnera FCO_NRO: falta evidencia que demuestre el origen del mensaje." },
  { text: "Las claves de cifrado se guardan en texto plano y nunca se destruyen.", cls: "FCS", fam: "CKM", feedback: "Se vulnera FCS_CKM: el ciclo de vida de la clave no protege su almacenamiento ni su destrucción." },
  { text: "Tras borrar un archivo, otro usuario lee su contenido en el espacio reasignado.", cls: "FDP", fam: "RIP", feedback: "Se vulnera FDP_RIP: la información residual sigue siendo recuperable tras liberar el objeto." },
  { text: "Cualquier usuario puede modificar los atributos de seguridad de los objetos.", cls: "FMT", fam: "MSA", feedback: "Se vulnera FMT_MSA: no se restringe quién puede gestionar los atributos de seguridad." },
  { text: "Un proveedor vincula las compras «anónimas» de un cliente por su dispositivo.", cls: "FPR", fam: "UNL", feedback: "Se vulnera FPR_UNL: es posible correlacionar operaciones del mismo usuario." },
  { text: "Un dispositivo no detecta que su carcasa fue abierta o manipulada.", cls: "FPT", fam: "PHP", feedback: "Se vulnera FPT_PHP: el TSF no detecta ni responde a la manipulación física." },
  { text: "Tras una caída, el sistema arranca en un estado inseguro.", cls: "FPT", fam: "RCV", feedback: "Se vulnera FPT_RCV: la recuperación no restaura un estado seguro." },
  { text: "Un único usuario consume toda la memoria y deja sin servicio a los demás.", cls: "FRU", fam: "RSA", feedback: "Se vulnera FRU_RSA: no hay cuotas que limiten la asignación de recursos por sujeto." },
  { text: "Una sesión inactiva permanece abierta durante horas.", cls: "FTA", fam: "SSL", feedback: "Se vulnera FTA_SSL: el TOE no bloquea ni termina la sesión tras inactividad." },
  { text: "El administrador accede de forma remota con credenciales enviadas en claro.", cls: "FTP", fam: "TRP", feedback: "Se vulnera FTP_TRP: la ruta hacia el TSF no está protegida frente a observación o suplantación." },
  { text: "Un dato se altera en tránsito entre dos sistemas y el receptor no lo detecta.", cls: "FDP", fam: "UIT", feedback: "Se vulnera FDP_UIT: falta protección de integridad en la transferencia entre TOEs." },
  { text: "Un atacante extrae la clave midiendo el consumo eléctrico del chip.", cls: "FPT", fam: "EMS", feedback: "Se vulnera FPT_EMS: el TOE no limita la fuga de información por canales laterales." },
  { text: "No se muestra el aviso legal antes de iniciar sesión.", cls: "FTA", fam: "TAB", feedback: "Se vulnera FTA_TAB: el TOE no presenta el banner de acceso antes de la sesión." },
  { text: "Un usuario inicia sesión simultáneamente desde 10 dispositivos.", cls: "FTA", fam: "MCS", feedback: "Se vulnera FTA_MCS: no se limita el número de sesiones concurrentes." }
];

const DRAG_SENTENCES = [
  { parts: ["La familia FIA_", " (fallos de autenticación) bloquea al usuario tras varios intentos ", "."], answers: ["AFL", "fallidos"], distractors: ["UID", "abiertos"] },
  { parts: ["FDP_", " (información residual) evita recuperar datos de objetos ya ", "."], answers: ["RIP", "liberados"], distractors: ["RPL", "bloqueados"] },
  { parts: ["FCS_", " (gestión de claves) cubre generación, distribución, acceso y ", " de claves criptográficas."], answers: ["CKM", "destrucción"], distractors: ["COP", "impresión"] },
  { parts: ["FPT_", " proporciona sellos de ", " fiables para eventos y datos."], answers: ["STM", "tiempo"], distractors: ["SSP", "color"] },
  { parts: ["FTA_", " muestra un ", " (banner) antes de la sesión."], answers: ["TAB", "aviso"], distractors: ["TAH", "registro"] },
  { parts: ["FRU_", " limita la asignación de ", " por usuario o sujeto."], answers: ["RSA", "recursos"], distractors: ["FLT", "claves"] }
];

const KEYWORD_MATCH = [
  { keyword: "Registro, evento, alarma", cls: "FAU" },
  { keyword: "Firma, prueba de origen", cls: "FCO" },
  { keyword: "Clave, cifrado", cls: "FCS" },
  { keyword: "Política de control de acceso", cls: "FDP" },
  { keyword: "Contraseña, token, ID", cls: "FIA" },
  { keyword: "Rol, atributo, revocación", cls: "FMT" },
  { keyword: "Seudónimo, anonimato", cls: "FPR" },
  { keyword: "Tamper, recuperación, autoprueba", cls: "FPT" },
  { keyword: "Cuota, prioridad, tolerancia a fallos", cls: "FRU" },
  { keyword: "Sesión, bloqueo, banner", cls: "FTA" },
  { keyword: "Canal, ruta de confianza", cls: "FTP" }
];

const MAP_ROUNDS = [
  { cls: "FAU", pool: ["ARP", "GEN", "SAR", "STG", "AFL", "TAB"] },
  { cls: "FIA", pool: ["AFL", "ATD", "UID", "UAU", "ARP", "MCS"] },
  { cls: "FTA", pool: ["LSA", "MCS", "SSL", "TAB", "UID", "GEN"] },
  { cls: "FPR", pool: ["ANO", "PSE", "UNL", "UNO", "SMR", "FLS"] }
];

const CONFUSIONS = [
  {
    a: { code: "FPT_ITT", name: "Datos TSF internos", desc: "Protege los datos del propio mecanismo de seguridad transferidos dentro del TOE." },
    b: { code: "FDP_ITT", name: "Datos de usuario internos", desc: "Protege los datos de usuario transferidos entre partes internas del TOE." },
    note: "La diferencia está en el objeto protegido: TSF frente a datos de usuario."
  },
  {
    a: { code: "FTP_ITC", name: "Canal de confianza", desc: "Comunicación protegida entre el TOE y otra entidad de confianza." },
    b: { code: "FDP_ITC", name: "Importación de datos", desc: "Controla la entrada y fiabilidad de datos externos importados al TOE." },
    note: "ITC en FTP es un canal; en FDP es una importación de datos."
  },
  {
    a: { code: "FIA_UAU", name: "Autenticación", desc: "Comprueba que el usuario es quien dice ser." },
    b: { code: "FIA_UID", name: "Identificación", desc: "Establece quién es el usuario antes de autenticarlo." },
    note: "Primero se identifica (UID); después se autentica (UAU)."
  },
  {
    a: { code: "FCO_NRO", name: "No repudio de origen", desc: "Evidencia de que el mensaje fue enviado por ese sujeto." },
    b: { code: "FCO_NRR", name: "No repudio de recepción", desc: "Evidencia de que el mensaje fue recibido por el destinatario." },
    note: "NRO prueba el envío; NRR prueba la entrega."
  }
];

const QUIZ_PLAN = [
  { type: "scenario-class", i: 0 }, { type: "scenario-class", i: 1 },
  { type: "scenario-class", i: 2 }, { type: "scenario-class", i: 4 },
  { type: "scenario-class", i: 7 }, { type: "scenario-class", i: 9 },
  { type: "scenario-class", i: 10 }, { type: "scenario-class", i: 11 },
  { type: "scenario-sfr", i: 3 }, { type: "scenario-sfr", i: 5 },
  { type: "scenario-sfr", i: 6 }, { type: "scenario-sfr", i: 8 },
  { type: "family-class", code: "FPT_STM", cls: "FPT" },
  { type: "family-class", code: "FDP_UIT", cls: "FDP" },
  { type: "family-class", code: "FTP_ITC", cls: "FTP" }
];

const ALL_CLASSES = CLASSES.map(c => c.code);
const ALL_FAMILIES = CLASSES.flatMap(c => c.families.map(f => ({ ...f, cls: c.code })));
