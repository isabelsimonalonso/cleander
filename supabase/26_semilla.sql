-- ═══════════════════════════════════════════════════════════════════════
--  26_semilla.sql — perfiles de muestra para el lanzamiento
-- ═══════════════════════════════════════════════════════════════════════
--
--  Crea 106 perfiles inventados: uno por cada una de las 53 categorías
--  de GRUPOS_SERVICIOS, en los dos lados (53 'servicio' + 53 'cliente').
--  Así ninguna búsqueda por categoría devuelve el mazo vacío.
--
--  Se reparten por las 20 provincias más pobladas, en vez de amontonarlos
--  en una. Dos motivos:
--
--   · Sin tocar nada, todo el mundo los ve: los filtros de Descubrir nacen
--     vacíos (Descubrir.jsx:21) y vacío significa «sin filtrar».
--   · Pero el filtro de provincia está a la vista, y en cuanto alguien lo
--     usa para buscar en lo suyo, solo le sale lo que haya allí. Repartidos,
--     a la mayoría le sale algo; amontonados en Madrid, a nadie más.
--
--  Cada provincia se lleva cinco o seis perfiles, de las dos clases y de
--  categorías distintas, porque el reparto va rotando sobre una lista de
--  106 que ya venía ordenada por categoría.
--
--  Las provincias que no estén en la lista siguen viendo las 106 mientras
--  no filtren. Para cubrir las 52 bastaría con alargar la lista de abajo.
--
--  Tienen que estar escritos EXACTAMENTE igual que en el desplegable de
--  la web, porque `descubrir()` los compara con igualdad exacta
--  (22_unidad_precio.sql:55-56), no con `ilike`. La lista es la del INE,
--  en frontend/src/data/municipios.json.
--
--  Cómo son estos perfiles, y por qué:
--
--   · SIN FOTO. Una cara sacada de internet o de un banco de imágenes es
--     de una persona real que no ha dado permiso. La tarjeta pinta sola
--     el icono del oficio cuando `foto_url` es nulo.
--   · SIN TELÉFONO. El teléfono solo sale por `mis_matches()`, y estas
--     cuentas nunca dan 'like', así que nunca hay match y el campo nunca
--     se muestra. Dejarlo vacío evita que nadie llame a un desconocido.
--   · SIN CONTRASEÑA VÁLIDA. `encrypted_password` no es un hash real y no
--     se crea fila en `auth.identities`: no se puede entrar como ellos.
--   · Nombre de pila + inicial, para no coincidir con nadie de verdad.
--
--  Todas llevan el dominio @semilla.cleander.app, que es lo que permite
--  borrarlas de golpe al final del archivo.
--
--  Se ejecuta en Supabase → SQL Editor. Allí `auth.uid()` es null, así que
--  `trg_proteger_perfil` deja aprobar resúmenes y tocar la foto
--  (10_moderacion_fotos.sql:31).
-- ═══════════════════════════════════════════════════════════════════════

begin;

-- ↓↓↓ DÓNDE VIVEN. Escritos como el INE, que es como los compara el
--     filtro: igualdad exacta, no «se parece» (22_unidad_precio.sql:55).
--     Si añades una, se reparte sola. ↓↓↓
create temp table ciudades on commit drop as
select * from (values
  ( 0, 'Madrid',                  'Madrid'),
  ( 1, 'Barcelona',               'Barcelona'),
  ( 2, 'Valencia',                'Valencia'),
  ( 3, 'Sevilla',                 'Sevilla'),
  ( 4, 'Zaragoza',                'Zaragoza'),
  ( 5, 'Málaga',                  'Málaga'),
  ( 6, 'Murcia',                  'Murcia'),
  ( 7, 'Illes Balears',           'Palma de Mallorca'),
  ( 8, 'Las Palmas',              'Las Palmas de Gran Canaria'),
  ( 9, 'Bizkaia',                 'Bilbao'),
  (10, 'Alicante',                'Alicante/Alacant'),
  (11, 'Córdoba',                 'Córdoba'),
  (12, 'Valladolid',              'Valladolid'),
  (13, 'Pontevedra',              'Vigo'),
  (14, 'Asturias',                'Gijón'),
  (15, 'A Coruña',                'A Coruña'),
  (16, 'Granada',                 'Granada'),
  (17, 'Santa Cruz de Tenerife',  'Santa Cruz de Tenerife'),
  (18, 'Cádiz',                   'Jerez de la Frontera'),
  (19, 'Navarra',                 'Pamplona/Iruña')
) as t(k, provincia, municipio);
-- ↑↑↑ ------------------------------------------------------------- ↑↑↑

with gente (n, rol, nombre, categoria, precio, resumen) as (values

  -- ── Limpieza y hogar ────────────────────────────────────────────────
  (  1, 'servicio', 'Marta R.',   'Limpieza',                              14, 'Limpieza de pisos y comunidades. Productos incluidos. Disponible mañanas de lunes a viernes.'),
  (  2, 'servicio', 'Julián P.',  'Limpieza de cristales',                 16, 'Cristales, escaparates y ventanas de altura. Trabajo con pértiga y agua osmotizada.'),
  (  3, 'servicio', 'Nuria C.',   'Limpieza de fin de obra',               18, 'Dejo la vivienda lista para entrar a vivir después de la reforma. Retirada de restos incluida.'),
  (  4, 'servicio', 'Álvaro M.',  'Planchado y lavandería',                12, 'Recojo la ropa, la plancho y la devuelvo en 48 horas. También colada completa.'),
  (  5, 'servicio', 'Beatriz S.', 'Control de plagas',                     35, 'Cucarachas, chinches, termitas y avispas. Productos autorizados y certificado del tratamiento.'),

  -- ── Robótica y maquinaria en alquiler (tarifa por día) ──────────────
  (  6, 'servicio', 'Iván L.',    'Alquiler de robot aspirador',           18, 'Robot aspirador con base de vaciado. Lo llevo a casa y lo recojo. Mínimo dos días.'),
  (  7, 'servicio', 'Rocío D.',   'Alquiler de robot fregasuelos',         22, 'Fregasuelos automático para pisos grandes. Incluye recambios y detergente para toda la semana.'),
  (  8, 'servicio', 'Sergio V.',  'Alquiler de robot limpiacristales',     20, 'Robot para ventanales y mamparas. Muy útil si tienes cristales a los que no llegas.'),
  (  9, 'servicio', 'Elena G.',   'Alquiler de robot limpiafondos de piscina', 30, 'Limpiafondos automático para piscinas de hasta diez metros. Alquiler por fines de semana.'),
  ( 10, 'servicio', 'Óscar T.',   'Alquiler de robot cortacésped',         28, 'Cortacésped robot con cable perimetral. Lo instalo yo el primer día y te explico el manejo.'),
  ( 11, 'servicio', 'Paula N.',   'Alquiler de aspirador industrial',      25, 'Aspirador de sólidos y líquidos. Para obras, trasteros o después de una inundación.'),
  ( 12, 'servicio', 'Rubén A.',   'Alquiler de máquina de vapor',          24, 'Vapor a presión para juntas, baños y cocinas. Desinfecta sin productos químicos.'),
  ( 13, 'servicio', 'Silvia B.',  'Alquiler de hidrolimpiadora',           26, 'Hidrolimpiadora de agua a presión para fachadas, terrazas y coches. Con mangueras y boquillas.'),
  ( 14, 'servicio', 'Andrés Q.',  'Alquiler de abrillantadora de suelos',  32, 'Abrillantadora para terrazo y mármol. Incluye discos y cera. Explico el uso antes de dejarla.'),
  ( 15, 'servicio', 'Carmen F.',  'Alquiler de limpiamoquetas',            27, 'Máquina de inyección y extracción para moquetas, sofás y colchones. Con producto incluido.'),
  ( 16, 'servicio', 'Diego H.',   'Alquiler de deshumidificador',          15, 'Deshumidificador de obra para humedades o después de una fuga. Alquiler por semanas.'),
  ( 17, 'servicio', 'Lorena J.',  'Alquiler de generador eléctrico',       40, 'Generador de gasolina para obras, mudanzas o fiestas. Silencioso y con dos enchufes.'),
  ( 18, 'servicio', 'Tomás E.',   'Alquiler de andamio o escalera',        22, 'Andamio de aluminio y escaleras de tijera de varias alturas. Montaje incluido si hace falta.'),
  ( 19, 'servicio', 'Irene Z.',   'Alquiler de herramienta eléctrica',     16, 'Taladros, radiales, lijadoras y martillo percutor. Por días sueltos o fin de semana.'),

  -- ── Instalaciones y averías ─────────────────────────────────────────
  ( 20, 'servicio', 'Marcos I.',  'Fontanería',                            35, 'Fugas, grifería, cisternas y cambio de tuberías. Aviso urgente el mismo día si puedo.'),
  ( 21, 'servicio', 'Vanesa O.',  'Electricidad',                          38, 'Cuadros eléctricos, enchufes, avería general y boletín. Instaladora autorizada.'),
  ( 22, 'servicio', 'Gonzalo U.', 'Calefacción y calderas',                42, 'Mantenimiento y reparación de calderas de gas. Revisión anual y puesta a punto antes del frío.'),
  ( 23, 'servicio', 'Sonia Y.',   'Aire acondicionado',                    40, 'Instalación de split y conductos, limpieza de filtros y recarga de gas.'),
  ( 24, 'servicio', 'Hugo X.',    'Cerrajería',                            45, 'Aperturas sin romper, cambio de bombín y puertas acorazadas. También urgencias de noche.'),
  ( 25, 'servicio', 'Alicia W.',  'Desatascos',                            44, 'Desatascos de fregadero, baño y bajantes con máquina. Inspección con cámara si hace falta.'),
  ( 26, 'servicio', 'Raúl K.',    'Reparación de electrodomésticos',       33, 'Lavadoras, lavavajillas, hornos y frigoríficos de todas las marcas. Presupuesto antes de tocar nada.'),
  ( 27, 'servicio', 'Teresa R.',  'Antenas y televisión',                  30, 'Antenas colectivas e individuales, TDT y parabólicas. Resintonizado y cableado.'),
  ( 28, 'servicio', 'Ismael P.',  'Informática y redes',                   28, 'Ordenadores lentos, wifi que no llega, copias de seguridad y correo. Voy a domicilio.'),
  ( 29, 'servicio', 'Noelia C.',  'Placas solares',                        48, 'Estudio, instalación y legalización de autoconsumo. Te digo de verdad si te sale a cuenta.'),

  -- ── Obra y acabados ─────────────────────────────────────────────────
  ( 30, 'servicio', 'Adrián M.',  'Albañilería',                           34, 'Tabiques, alicatados, arreglos de fachada y pequeñas obras. Recojo los escombros.'),
  ( 31, 'servicio', 'Cristina S.','Pintura',                               25, 'Pintura de interiores, alisado de gotelé y esmalte de puertas. Protejo muebles y suelos.'),
  ( 32, 'servicio', 'Jorge L.',   'Carpintería',                           36, 'Muebles a medida, armarios empotrados y arreglo de puertas que rozan.'),
  ( 33, 'servicio', 'Patricia D.','Escayola y pladur',                     32, 'Techos de pladur, focos empotrados y molduras. Trabajo limpio y en plazo.'),
  ( 34, 'servicio', 'Emilio V.',  'Suelos y parquet',                      33, 'Instalación de laminado y vinílico, acuchillado y barnizado de parquet antiguo.'),
  ( 35, 'servicio', 'Miriam G.',  'Ventanas y cristalería',                38, 'Ventanas de aluminio y PVC, doble acristalamiento y cambio de cristales rotos.'),
  ( 36, 'servicio', 'Ángel T.',   'Persianas y toldos',                    30, 'Persianas que no suben, cintas, motores y toldos de terraza. Reparación y cambio.'),
  ( 37, 'servicio', 'Lucía N.',   'Reformas integrales',                   40, 'Reforma completa de cocinas y baños, con todos los gremios coordinados por mí.'),

  -- ── Exteriores ──────────────────────────────────────────────────────
  ( 38, 'servicio', 'Fernando A.','Jardinería',                            22, 'Siega, poda, setos y riego automático. Mantenimiento mensual o trabajo suelto.'),
  ( 39, 'servicio', 'Sara B.',    'Piscinas',                              30, 'Puesta a punto de primavera, tratamiento del agua y reparación de depuradoras.'),
  ( 40, 'servicio', 'Pablo Q.',   'Limpieza de tejados y canalones',       35, 'Canalones atascados, tejas rotas y musgo. Trabajo en altura con línea de vida.'),

  -- ── Muebles y mudanzas ──────────────────────────────────────────────
  ( 41, 'servicio', 'Inés F.',    'Montaje de muebles',                    24, 'Monto armarios, cocinas y estanterías de cualquier tienda. Traigo mis herramientas.'),
  ( 42, 'servicio', 'Javier H.',  'Mudanzas',                              30, 'Mudanzas de piso completo con furgón y dos personas. Embalaje si lo necesitas.'),
  ( 43, 'servicio', 'Clara J.',   'Portes y transporte',                   26, 'Portes pequeños, recogida de compras voluminosas y viajes al punto limpio.'),
  ( 44, 'servicio', 'Antonio E.', 'Tapicería',                             28, 'Tapizo sofás, sillas y cabeceros. Puedes elegir la tela o traerla tú.'),
  ( 45, 'servicio', 'Laura Z.',   'Vaciado de pisos',                      27, 'Vaciado completo de viviendas y trasteros, con separación de lo aprovechable.'),

  -- ── Cuidados a domicilio ────────────────────────────────────────────
  ( 46, 'servicio', 'Manuel I.',  'Cuidado de mayores',                    15, 'Acompañamiento, aseo y comidas. Experiencia con personas con movilidad reducida.'),
  ( 47, 'servicio', 'Eva O.',     'Cuidado de niños',                      13, 'Recogida del colegio, meriendas y deberes. Disponible por las tardes.'),
  ( 48, 'servicio', 'Daniel U.',  'Cuidado de mascotas',                   12, 'Paseos diarios y visitas a domicilio cuando te vas de viaje. Perros y gatos.'),

  -- ── Otros ───────────────────────────────────────────────────────────
  ( 49, 'servicio', 'Pilar Y.',   'Reparaciones generales',                26, 'Ese arreglo pequeño que llevas meses posponiendo: cuadros, silicona, bisagras, grifos.'),
  ( 50, 'servicio', 'Alberto X.', 'Costura y arreglos de ropa',            14, 'Bajos, cremalleras, ajustes de talla y arreglo de cortinas.'),
  ( 51, 'servicio', 'Natalia W.', 'Cocina a domicilio',                    28, 'Cocino en tu casa para cenas y celebraciones, o dejo la semana preparada en tápers.'),
  ( 52, 'servicio', 'Ramón K.',   'Clases particulares',                   18, 'Matemáticas y física de secundaria y bachillerato. A domicilio o en biblioteca.'),
  ( 53, 'servicio', 'Celia R.',   'Peluquería y estética a domicilio',     22, 'Corte, color y manicura en tu casa. Muy cómodo si te cuesta salir.'),

  -- ═════════════════════════════════════════════════════════════════════
  --  CLIENTES: la misma lista de categorías, vista desde quien la busca.
  -- ═════════════════════════════════════════════════════════════════════

  -- ── Limpieza y hogar ────────────────────────────────────────────────
  ( 54, 'cliente', 'Rosa M.',      'Limpieza',                              14, 'Busco a alguien para el piso dos mañanas por semana. Somos tres en casa y un perro.'),
  ( 55, 'cliente', 'Víctor P.',    'Limpieza de cristales',                 16, 'Tengo un ventanal grande al que no llego y da a un patio interior.'),
  ( 56, 'cliente', 'Amparo C.',    'Limpieza de fin de obra',               18, 'Acabamos de reformar la cocina y aquello está lleno de polvo de yeso.'),
  ( 57, 'cliente', 'Nicolás S.',   'Planchado y lavandería',                12, 'Necesito que alguien se lleve la plancha de la semana. Camisas sobre todo.'),
  ( 58, 'cliente', 'Yolanda L.',   'Control de plagas',                     35, 'Han salido cucarachas en el bajo del edificio y quiero tratarlo antes del verano.'),

  -- ── Robótica y maquinaria en alquiler ───────────────────────────────
  ( 59, 'cliente', 'Bruno D.',     'Alquiler de robot aspirador',           18, 'Quiero probar uno una semana antes de decidir si me compro el mío.'),
  ( 60, 'cliente', 'Estrella V.',  'Alquiler de robot fregasuelos',         22, 'Me he roto un pie y necesito apañarme unas semanas sin fregar a mano.'),
  ( 61, 'cliente', 'Aitor G.',     'Alquiler de robot limpiacristales',     20, 'Tengo mamparas y ventanas altas y quiero probar si el robot se apaña.'),
  ( 62, 'cliente', 'Marina T.',    'Alquiler de robot limpiafondos de piscina', 30, 'Abrimos la piscina en junio y solo lo necesito ese fin de semana.'),
  ( 63, 'cliente', 'Félix N.',     'Alquiler de robot cortacésped',         28, 'Me voy tres semanas y quiero dejar el césped controlado mientras no estoy.'),
  ( 64, 'cliente', 'Cecilia A.',   'Alquiler de aspirador industrial',      25, 'Vamos a vaciar el trastero y aquello lleva años sin abrirse.'),
  ( 65, 'cliente', 'Joaquín B.',   'Alquiler de máquina de vapor',          24, 'Quiero desinfectar las juntas del baño sin usar lejía, que tengo críos.'),
  ( 66, 'cliente', 'Olga Q.',      'Alquiler de hidrolimpiadora',           26, 'La terraza y la fachada del garaje están negras. Un fin de semana me basta.'),
  ( 67, 'cliente', 'Enrique F.',   'Alquiler de abrillantadora de suelos',  32, 'Tengo terrazo antiguo y quiero ver cómo queda antes de plantearme cambiarlo.'),
  ( 68, 'cliente', 'Susana H.',    'Alquiler de limpiamoquetas',            27, 'El sofá y las alfombras piden una limpieza a fondo. Un día suelto.'),
  ( 69, 'cliente', 'Mateo J.',     'Alquiler de deshumidificador',          15, 'Tuvimos una fuga del vecino y la pared no termina de secarse.'),
  ( 70, 'cliente', 'Belén E.',     'Alquiler de generador eléctrico',       40, 'Celebración familiar en una finca sin luz. Lo necesito solo un sábado.'),
  ( 71, 'cliente', 'Samuel Z.',    'Alquiler de andamio o escalera',        22, 'Tengo que pintar el hueco de la escalera y no llego ni de lejos.'),
  ( 72, 'cliente', 'Dolores I.',   'Alquiler de herramienta eléctrica',     16, 'Necesito un martillo percutor un par de días para colgar unas baldas.'),

  -- ── Instalaciones y averías ─────────────────────────────────────────
  ( 73, 'cliente', 'Arturo O.',    'Fontanería',                            35, 'Gotea el grifo de la cocina y la cisterna del baño no para de correr.'),
  ( 74, 'cliente', 'Mónica U.',    'Electricidad',                          38, 'Salta el automático cuando enciendo el horno y la vitro a la vez.'),
  ( 75, 'cliente', 'Lorenzo Y.',   'Calefacción y calderas',                42, 'La caldera tiene doce años y quiero la revisión antes de que llegue el frío.'),
  ( 76, 'cliente', 'Ana X.',       'Aire acondicionado',                    40, 'Quiero poner un split en el dormitorio antes del verano. Piso de 70 metros.'),
  ( 77, 'cliente', 'Guillermo W.', 'Cerrajería',                            45, 'Me he quedado con media llave dentro del bombín de la puerta de casa.'),
  ( 78, 'cliente', 'Trinidad K.',  'Desatascos',                            44, 'El fregadero traga muy despacio y ya he probado todo lo del supermercado.'),
  ( 79, 'cliente', 'Héctor R.',    'Reparación de electrodomésticos',       33, 'La lavadora no centrifuga y tiene solo cuatro años. Quiero saber si merece arreglarla.'),
  ( 80, 'cliente', 'Alba P.',      'Antenas y televisión',                  30, 'Desde el temporal se ve fatal la mitad de los canales.'),
  ( 81, 'cliente', 'Ignacio C.',   'Informática y redes',                   28, 'El wifi no llega al fondo de la casa y trabajo desde esa habitación.'),
  ( 82, 'cliente', 'Carla M.',     'Placas solares',                        48, 'Quiero que alguien me diga con números si me compensa ponerlas en mi tejado.'),

  -- ── Obra y acabados ─────────────────────────────────────────────────
  ( 83, 'cliente', 'Salvador S.',  'Albañilería',                           34, 'Se ha caído un trozo de alicatado del baño y quiero repararlo bien.'),
  ( 84, 'cliente', 'Gloria L.',    'Pintura',                               25, 'Piso de dos habitaciones, quitar gotelé y pintar en blanco. Está vacío.'),
  ( 85, 'cliente', 'Bernardo D.',  'Carpintería',                           36, 'Quiero un armario a medida en un hueco raro del pasillo.'),
  ( 86, 'cliente', 'Ángeles V.',   'Escayola y pladur',                     32, 'Quiero bajar el techo del salón y meter focos empotrados.'),
  ( 87, 'cliente', 'Emma G.',      'Suelos y parquet',                      33, 'El parquet está muy rayado. Dudo entre acuchillarlo o poner laminado encima.'),
  ( 88, 'cliente', 'Nieves T.',    'Ventanas y cristalería',                38, 'Las ventanas son de aluminio viejo y se oye la calle entera.'),
  ( 89, 'cliente', 'Lucas N.',     'Persianas y toldos',                    30, 'La persiana del salón se ha quedado a medias y no sube ni baja.'),
  ( 90, 'cliente', 'Carolina A.',  'Reformas integrales',                   40, 'Piso heredado de los años setenta. Hay que hacerlo entero, sin prisa pero con presupuesto.'),

  -- ── Exteriores ──────────────────────────────────────────────────────
  ( 91, 'cliente', 'Aurelio B.',   'Jardinería',                            22, 'Jardín pequeño con seto y césped. Busco mantenimiento una vez al mes.'),
  ( 92, 'cliente', 'Ainhoa Q.',    'Piscinas',                              30, 'El agua se me pone verde cada verano y nunca doy con el punto.'),
  ( 93, 'cliente', 'Borja F.',     'Limpieza de tejados y canalones',       35, 'Los canalones están llenos de hojas y en la última tormenta se desbordaron.'),

  -- ── Muebles y mudanzas ──────────────────────────────────────────────
  ( 94, 'cliente', 'Encarna H.',   'Montaje de muebles',                    24, 'Tengo tres cajas de un armario en el pasillo desde hace un mes.'),
  ( 95, 'cliente', 'Martín J.',    'Mudanzas',                              30, 'Me mudo dentro del mismo pueblo. Piso de dos habitaciones, con ascensor en los dos.'),
  ( 96, 'cliente', 'Valeria E.',   'Portes y transporte',                   26, 'He comprado un sofá de segunda mano y no tengo cómo traerlo.'),
  ( 97, 'cliente', 'Gabriel Z.',   'Tapicería',                             28, 'Tengo dos sillones buenos de mi madre y quiero tapizarlos en vez de tirarlos.'),
  ( 98, 'cliente', 'Soledad I.',   'Vaciado de pisos',                      27, 'Hay que vaciar la casa de mis padres. Sin prisa y con cuidado con lo que hay dentro.'),

  -- ── Cuidados a domicilio ────────────────────────────────────────────
  ( 99, 'cliente', 'Anselmo O.',   'Cuidado de mayores',                    15, 'Busco acompañamiento para mi padre por las mañanas, tres días por semana.'),
  (100, 'cliente', 'Herminia U.',  'Cuidado de niños',                      13, 'Necesito que recojan a los niños del colegio dos tardes por semana.'),
  (101, 'cliente', 'Leandro Y.',   'Cuidado de mascotas',                   12, 'Dos paseos al día para mi perra las semanas que viajo por trabajo.'),

  -- ── Otros ───────────────────────────────────────────────────────────
  (102, 'cliente', 'Lidia X.',     'Reparaciones generales',                26, 'Tengo una lista de diez chapuzas pequeñas por toda la casa.'),
  (103, 'cliente', 'Ernesto W.',   'Costura y arreglos de ropa',            14, 'Unos pantalones para coger bajos y una cremallera de cazadora.'),
  (104, 'cliente', 'Adoración K.', 'Cocina a domicilio',                    28, 'Cena de cumpleaños en casa para doce personas. Prefiero no cocinar ese día.'),
  (105, 'cliente', 'Prudencio R.', 'Clases particulares',                   18, 'Mi hija va floja en matemáticas de tercero de la ESO.'),
  (106, 'cliente', 'Benita P.',    'Peluquería y estética a domicilio',     22, 'Salgo poco de casa y me vendría bien que vinieran a cortarme el pelo.'))

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'semilla' || lpad(g.n::text, 3, '0') || '@semilla.cleander.app',
  -- No es un hash válido: ninguna contraseña puede coincidir nunca.
  'semilla-sin-acceso-' || gen_random_uuid()::text,
  now(),
  -- Fechas repartidas hacia atrás para que no parezcan creadas de golpe.
  now() - (g.n || ' hours')::interval,
  now() - (g.n || ' hours')::interval,
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object(
    'rol',         g.rol,
    'nombre',      g.nombre,
    'telefono',    '',
    'ciudad',      c.municipio,
    'categoria',   g.categoria,
    'precio_hora', g.precio::text,
    'resumen',     g.resumen
  )
-- El reparto: la lista de 106 ya viene ordenada por categoría, así que
-- rotar sobre las ciudades deja en cada una oficios distintos y de los
-- dos lados, en vez de veinte fontaneros en Bilbao.
from gente g
join ciudades c on c.k = (g.n - 1) % (select count(*) from ciudades);

-- `trg_nuevo_usuario` sigue siendo el de 01_esquema.sql y solo rellena los
-- campos que existían entonces: no sabe de `provincia` ni de
-- `unidad_precio`, que llegaron en migraciones posteriores. Se completan
-- aquí, junto con la moderación, que estas tarjetas no tienen que pasar.
update public.perfiles p
   set resumen_estado = 'aprobado',
       foto_estado    = 'aprobada',        -- no hay foto que moderar
       provincia      = c.provincia,
       -- Los alquileres se cobran por día, no por hora (22_unidad_precio.sql)
       unidad_precio  = case when p.categoria like 'Alquiler de%'
                             then 'dia' else 'hora' end,
       -- La misma fecha que la cuenta, repartida hacia atrás, para que en
       -- el panel no aparezcan las 106 apiladas en el mismo minuto.
       creado_en      = u.created_at
  from auth.users u
  join ciudades c on c.municipio = p.ciudad
 where u.id = p.id
   and u.email like '%@semilla.cleander.app';

commit;


-- ═══════════════════════════════════════════════════════════════════════
--  COMPROBACIÓN — qué ha quedado
-- ═══════════════════════════════════════════════════════════════════════
--
-- select rol,
--        count(*)                  as perfiles,
--        count(distinct categoria) as categorias,
--        count(distinct provincia) as provincias
--   from public.perfiles
--  where id in (select id from auth.users
--                where email like '%@semilla.cleander.app')
--  group by rol;
--
-- Debe salir, en cada fila: 53 perfiles, 53 categorías y 20 provincias.
--
-- Y para ver el reparto por sitio:
--
-- select provincia, ciudad, count(*)
--   from public.perfiles
--  where id in (select id from auth.users
--                where email like '%@semilla.cleander.app')
--  group by provincia, ciudad order by provincia;


-- ═══════════════════════════════════════════════════════════════════════
--  BORRADO — cuando haya usuarios de verdad, esto las quita todas
-- ═══════════════════════════════════════════════════════════════════════
--
--  Borra también los 'like' que hayan recibido, sus matches y sus
--  valoraciones, porque todas las claves ajenas van con `on delete
--  cascade` (01_esquema.sql:15, 56, 74, 86).
--
--  No toca ni una sola cuenta real: el filtro es el dominio del correo.
--
-- delete from auth.users where email like '%@semilla.cleander.app';
