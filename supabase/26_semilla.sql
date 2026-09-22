-- ═══════════════════════════════════════════════════════════════════════
--  26_semilla.sql — perfiles de muestra para el lanzamiento
-- ═══════════════════════════════════════════════════════════════════════
--
--  312 perfiles inventados: las 52 provincias, tres de cada lado en cada
--  una. Así ninguna búsqueda por provincia devuelve el mazo vacío, filtre
--  quien filtre y desde donde filtre.
--
--  Están las 53 categorías, y ninguna provincia repite oficio dentro de su
--  terna. Cada categoría sale unas seis veces en toda España.
--
--  Los resúmenes, y aquí hubo que rehacerlo: el primero de cada categoría
--  lleva un texto escrito para ese oficio, y el resto sale de una reserva
--  de textos generales. La primera versión tenía una reserva única para
--  todo, escrita pensando en oficios de reparación, y saltaban cosas como
--  «me han dicho que lo haga ya, antes de que vaya a peor» en una tarjeta
--  de Cuidado de niños.
--
--  Ahora la reserva es POR GRUPO: seis textos para cada uno de los ocho
--  grupos y cada rol. El registro de un alquiler no es el de un cuidado ni
--  el de una avería, y se nota en cuanto los pones juntos.
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
--  Los municipios y provincias van escritos como el INE, que es como los
--  compara el filtro: igualdad exacta, no «se parece»
--  (22_unidad_precio.sql:55-56). La lista es la de
--  frontend/src/data/municipios.json.
--
--  ── Cómo ejecutarlo ────────────────────────────────────────────────────
--
--  De una vez, entero, en Supabase → SQL Editor.
--
--  No hay `begin`/`commit` ni tablas temporales a propósito: el editor de
--  Supabase ejecuta cada instrucción en su propia transacción, así que una
--  tabla temporal creada en una línea ya no existe en la siguiente.
--
--  Se puede repetir las veces que haga falta: empieza borrando lo suyo.
--
--  Allí `auth.uid()` es null, así que `trg_proteger_perfil` deja aprobar
--  los resúmenes y tocar la foto (10_moderacion_fotos.sql:31).
-- ═══════════════════════════════════════════════════════════════════════


-- ── 1 · Fuera los de antes, para poder repetir ─────────────────────────

delete from auth.users where email like '%@semilla.cleander.app';


-- ── 2 · Los 312 perfiles ───────────────────────────────────────────────

with gente (n, rol, nombre, categoria, precio, municipio, resumen) as (values

  -- ── A Coruña ──
  (  1, 'servicio' , 'Fernando R.' , 'Limpieza'                                 ,  14, 'A Coruña'                                  , 'Limpieza de pisos y comunidades. Productos incluidos. Disponible mañanas de lunes a viernes.'),
  (  2, 'servicio' , 'Guillermo R.', 'Limpieza de cristales'                    ,  16, 'A Coruña'                                  , 'Cristales, escaparates y ventanas de altura. Trabajo con pértiga y agua osmotizada.'),
  (  3, 'servicio' , 'Rubén P.'    , 'Limpieza de fin de obra'                  ,  18, 'A Coruña'                                  , 'Dejo la vivienda lista para entrar a vivir después de la reforma. Retirada de restos incluida.'),
  (  4, 'cliente'  , 'Pilar P.'    , 'Alquiler de robot limpiacristales'        ,  20, 'A Coruña'                                  , 'Tengo mamparas y ventanas altas y quiero probar si el robot se apaña.'),
  (  5, 'cliente'  , 'Ainhoa P.'   , 'Alquiler de robot limpiafondos de piscina',  30, 'A Coruña'                                  , 'Abrimos la piscina en junio y solo lo necesito ese fin de semana.'),
  (  6, 'cliente'  , 'Sonia C.'    , 'Alquiler de robot cortacésped'            ,  28, 'A Coruña'                                  , 'Me voy tres semanas y quiero dejar el césped controlado mientras no estoy.'),

  -- ── Albacete ──
  (  7, 'servicio' , 'Aitor C.'    , 'Planchado y lavandería'                   ,  12, 'Albacete'                                  , 'Recojo la ropa, la plancho y la devuelvo en 48 horas. También colada completa.'),
  (  8, 'servicio' , 'Unai C.'     , 'Control de plagas'                        ,  35, 'Albacete'                                  , 'Cucarachas, chinches, termitas y avispas. Productos autorizados y certificado del tratamiento.'),
  (  9, 'servicio' , 'Emilio S.'   , 'Alquiler de robot aspirador'              ,  18, 'Albacete'                                  , 'Robot aspirador con base de vaciado. Lo llevo a casa y lo recojo. Mínimo dos días.'),
  ( 10, 'cliente'  , 'Arturo S.'   , 'Alquiler de aspirador industrial'         ,  25, 'Albacete'                                  , 'Vamos a vaciar el trastero y aquello lleva años sin abrirse.'),
  ( 11, 'cliente'  , 'Sergio L.'   , 'Alquiler de máquina de vapor'             ,  24, 'Albacete'                                  , 'Quiero desinfectar las juntas del baño sin usar lejía, que tengo críos.'),
  ( 12, 'cliente'  , 'Laura L.'    , 'Alquiler de hidrolimpiadora'              ,  26, 'Albacete'                                  , 'La terraza y la fachada del garaje están negras. Un fin de semana me basta.'),

  -- ── Alicante ──
  ( 13, 'servicio' , 'Emma L.'     , 'Alquiler de robot fregasuelos'            ,  22, 'Alicante/Alacant'                          , 'Fregasuelos automático para pisos grandes. Incluye recambios y detergente para toda la semana.'),
  ( 14, 'servicio' , 'Irene D.'    , 'Alquiler de robot limpiacristales'        ,  20, 'Alicante/Alacant'                          , 'Robot para ventanales y mamparas. Muy útil si tienes cristales a los que no llegas.'),
  ( 15, 'servicio' , 'Amparo D.'   , 'Alquiler de robot limpiafondos de piscina',  30, 'Alicante/Alacant'                          , 'Limpiafondos automático para piscinas de hasta diez metros. Alquiler por fines de semana.'),
  ( 16, 'cliente'  , 'Ernesto D.'  , 'Alquiler de abrillantadora de suelos'     ,  32, 'Alicante/Alacant'                          , 'Tengo terrazo antiguo y quiero ver cómo queda antes de plantearme cambiarlo.'),
  ( 17, 'cliente'  , 'Adrián V.'   , 'Alquiler de limpiamoquetas'               ,  27, 'Alicante/Alacant'                          , 'El sofá y las alfombras piden una limpieza a fondo. Un día suelto.'),
  ( 18, 'cliente'  , 'Susana V.'   , 'Alquiler de deshumidificador'             ,  15, 'Alicante/Alacant'                          , 'Tuvimos una fuga del vecino y la pared no termina de secarse.'),

  -- ── Almería ──
  ( 19, 'servicio' , 'Álvaro G.'   , 'Alquiler de robot cortacésped'            ,  28, 'Almería'                                   , 'Cortacésped robot con cable perimetral. Lo instalo yo el primer día y te explico el manejo.'),
  ( 20, 'servicio' , 'Inés G.'     , 'Alquiler de aspirador industrial'         ,  25, 'Almería'                                   , 'Aspirador de sólidos y líquidos. Para obras, trasteros o después de una inundación.'),
  ( 21, 'servicio' , 'Ignacio G.'  , 'Alquiler de máquina de vapor'             ,  24, 'Almería'                                   , 'Vapor a presión para juntas, baños y cocinas. Desinfecta sin productos químicos.'),
  ( 22, 'cliente'  , 'Carmen T.'   , 'Alquiler de generador eléctrico'          ,  40, 'Almería'                                   , 'Celebración familiar en una finca sin luz. Lo necesito solo un sábado.'),
  ( 23, 'cliente'  , 'Ramón T.'    , 'Alquiler de andamio o escalera'           ,  22, 'Almería'                                   , 'Tengo que pintar el hueco de la escalera y no llego ni de lejos.'),
  ( 24, 'cliente'  , 'Valeria T.'  , 'Alquiler de herramienta eléctrica'        ,  16, 'Almería'                                   , 'Necesito un martillo percutor un par de días para colgar unas baldas.'),

  -- ── Asturias ──
  ( 25, 'servicio' , 'Raúl N.'     , 'Alquiler de hidrolimpiadora'              ,  26, 'Gijón'                                     , 'Hidrolimpiadora de agua a presión para fachadas, terrazas y coches. Con mangueras y boquillas.'),
  ( 26, 'servicio' , 'Cecilia N.'  , 'Alquiler de abrillantadora de suelos'     ,  32, 'Gijón'                                     , 'Abrillantadora para terrazo y mármol. Incluye discos y cera. Explico el uso antes de dejarla.'),
  ( 27, 'servicio' , 'Rebeca N.'   , 'Alquiler de limpiamoquetas'               ,  27, 'Gijón'                                     , 'Máquina de inyección y extracción para moquetas, sofás y colchones. Con producto incluido.'),
  ( 28, 'cliente'  , 'Lucía A.'    , 'Fontanería'                               ,  35, 'Gijón'                                     , 'Gotea el grifo de la cocina y la cisterna del baño no para de correr.'),
  ( 29, 'cliente'  , 'Ana A.'      , 'Electricidad'                             ,  38, 'Gijón'                                     , 'Salta el automático cuando enciendo el horno y la vitro a la vez.'),
  ( 30, 'cliente'  , 'Paula B.'    , 'Calefacción y calderas'                   ,  42, 'Gijón'                                     , 'La caldera tiene doce años y quiero la revisión antes de que llegue el frío.'),

  -- ── Badajoz ──
  ( 31, 'servicio' , 'Daniel B.'   , 'Alquiler de deshumidificador'             ,  15, 'Badajoz'                                   , 'Deshumidificador de obra para humedades o después de una fuga. Alquiler por semanas.'),
  ( 32, 'servicio' , 'Carolina B.' , 'Alquiler de generador eléctrico'          ,  40, 'Badajoz'                                   , 'Generador de gasolina para obras, mudanzas o fiestas. Silencioso y con dos enchufes.'),
  ( 33, 'servicio' , 'Gonzalo Q.'  , 'Alquiler de andamio o escalera'           ,  22, 'Badajoz'                                   , 'Andamio de aluminio y escaleras de tijera de varias alturas. Montaje incluido si hace falta.'),
  ( 34, 'cliente'  , 'Bruno Q.'    , 'Aire acondicionado'                       ,  40, 'Badajoz'                                   , 'Quiero poner un split en el dormitorio antes del verano. Piso de 70 metros.'),
  ( 35, 'cliente'  , 'Jimena Q.'   , 'Cerrajería'                               ,  45, 'Badajoz'                                   , 'Me he quedado con media llave dentro del bombín de la puerta de casa.'),
  ( 36, 'cliente'  , 'Patricia F.' , 'Desatascos'                               ,  44, 'Badajoz'                                   , 'El fregadero traga muy despacio y ya he probado todo lo del supermercado.'),

  -- ── Barcelona ──
  ( 37, 'servicio' , 'Samuel F.'   , 'Alquiler de herramienta eléctrica'        ,  16, 'Barcelona'                                 , 'Taladros, radiales, lijadoras y martillo percutor. Por días sueltos o fin de semana.'),
  ( 38, 'servicio' , 'Rocío H.'    , 'Fontanería'                               ,  35, 'Barcelona'                                 , 'Fugas, grifería, cisternas y cambio de tuberías. Aviso urgente el mismo día si puedo.'),
  ( 39, 'servicio' , 'Antonio H.'  , 'Electricidad'                             ,  38, 'Barcelona'                                 , 'Cuadros eléctricos, enchufes, avería general y boletín. Instaladora autorizada.'),
  ( 40, 'cliente'  , 'Gloria H.'   , 'Reparación de electrodomésticos'          ,  33, 'Barcelona'                                 , 'La lavadora no centrifuga y tiene solo cuatro años. Quiero saber si merece arreglarla.'),
  ( 41, 'cliente'  , 'Tomás J.'    , 'Antenas y televisión'                     ,  30, 'Barcelona'                                 , 'Desde el temporal se ve fatal la mitad de los canales.'),
  ( 42, 'cliente'  , 'Víctor J.'   , 'Informática y redes'                      ,  28, 'Barcelona'                                 , 'El wifi no llega al fondo de la casa y trabajo desde esa habitación.'),

  -- ── Bizkaia ──
  ( 43, 'servicio' , 'Lidia J.'    , 'Calefacción y calderas'                   ,  42, 'Bilbao'                                    , 'Mantenimiento y reparación de calderas de gas. Revisión anual y puesta a punto antes del frío.'),
  ( 44, 'servicio' , 'Noelia E.'   , 'Aire acondicionado'                       ,  40, 'Bilbao'                                    , 'Instalación de split y conductos, limpieza de filtros y recarga de gas.'),
  ( 45, 'servicio' , 'Enrique E.'  , 'Cerrajería'                               ,  45, 'Bilbao'                                    , 'Aperturas sin romper, cambio de bombín y puertas acorazadas. También urgencias de noche.'),
  ( 46, 'cliente'  , 'Nuria Z.'    , 'Placas solares'                           ,  48, 'Bilbao'                                    , 'Quiero que alguien me diga con números si me compensa ponerlas en mi tejado.'),
  ( 47, 'cliente'  , 'Pablo Z.'    , 'Albañilería'                              ,  34, 'Bilbao'                                    , 'Se ha caído un trozo de alicatado del baño y quiero repararlo bien.'),
  ( 48, 'cliente'  , 'Alba Z.'     , 'Pintura'                                  ,  25, 'Bilbao'                                    , 'Piso de dos habitaciones, quitar gotelé y pintar en blanco. Está vacío.'),

  -- ── Burgos ──
  ( 49, 'servicio' , 'Andrés I.'   , 'Desatascos'                               ,  44, 'Burgos'                                    , 'Desatascos de fregadero, baño y bajantes con máquina. Inspección con cámara si hace falta.'),
  ( 50, 'servicio' , 'Natalia I.'  , 'Reparación de electrodomésticos'          ,  33, 'Burgos'                                    , 'Lavadoras, lavavajillas, hornos y frigoríficos de todas las marcas. Presupuesto antes de tocar nada.'),
  ( 51, 'servicio' , 'Martín I.'   , 'Antenas y televisión'                     ,  30, 'Burgos'                                    , 'Antenas colectivas e individuales, TDT y parabólicas. Resintonizado y cableado.'),
  ( 52, 'cliente'  , 'Alicia O.'   , 'Carpintería'                              ,  36, 'Burgos'                                    , 'Quiero un armario a medida en un hueco raro del pasillo.'),
  ( 53, 'cliente'  , 'Félix O.'    , 'Escayola y pladur'                        ,  32, 'Burgos'                                    , 'Quiero bajar el techo del salón y meter focos empotrados.'),
  ( 54, 'cliente'  , 'Mario O.'    , 'Suelos y parquet'                         ,  33, 'Burgos'                                    , 'El parquet está muy rayado. Dudo entre acuchillarlo o poner laminado encima.'),

  -- ── Cantabria ──
  ( 55, 'servicio' , 'Ángel U.'    , 'Informática y redes'                      ,  28, 'Santander'                                 , 'Ordenadores lentos, wifi que no llega, copias de seguridad y correo. Voy a domicilio.'),
  ( 56, 'servicio' , 'Lorenzo U.'  , 'Placas solares'                           ,  48, 'Santander'                                 , 'Estudio, instalación y legalización de autoconsumo. Te digo de verdad si te sale a cuenta.'),
  ( 57, 'servicio' , 'Óscar Y.'    , 'Albañilería'                              ,  34, 'Santander'                                 , 'Tabiques, alicatados, arreglos de fachada y pequeñas obras. Recojo los escombros.'),
  ( 58, 'cliente'  , 'Eva Y.'      , 'Ventanas y cristalería'                   ,  38, 'Santander'                                 , 'Las ventanas son de aluminio viejo y se oye la calle entera.'),
  ( 59, 'cliente'  , 'Lucas Y.'    , 'Persianas y toldos'                       ,  30, 'Santander'                                 , 'La persiana del salón se ha quedado a medias y no sube ni baja.'),
  ( 60, 'cliente'  , 'Vanesa X.'   , 'Reformas integrales'                      ,  40, 'Santander'                                 , 'Piso heredado de los años setenta. Hay que hacerlo entero, sin prisa pero con presupuesto.'),

  -- ── Castellón ──
  ( 61, 'servicio' , 'Yolanda X.'  , 'Pintura'                                  ,  25, 'Castellón de la Plana/Castelló de la Plana', 'Pintura de interiores, alisado de gotelé y esmalte de puertas. Protejo muebles y suelos.'),
  ( 62, 'servicio' , 'Iker X.'     , 'Carpintería'                              ,  36, 'Castellón de la Plana/Castelló de la Plana', 'Muebles a medida, armarios empotrados y arreglo de puertas que rozan.'),
  ( 63, 'servicio' , 'Jorge W.'    , 'Escayola y pladur'                        ,  32, 'Castellón de la Plana/Castelló de la Plana', 'Techos de pladur, focos empotrados y molduras. Trabajo limpio y en plazo.'),
  ( 64, 'cliente'  , 'Belén W.'    , 'Jardinería'                               ,  22, 'Castellón de la Plana/Castelló de la Plana', 'Jardín pequeño con seto y césped. Busco mantenimiento una vez al mes.'),
  ( 65, 'cliente'  , 'Iván K.'     , 'Piscinas'                                 ,  30, 'Castellón de la Plana/Castelló de la Plana', 'El agua se me pone verde cada verano y nunca doy con el punto.'),
  ( 66, 'cliente'  , 'Clara K.'    , 'Limpieza de tejados y canalones'          ,  35, 'Castellón de la Plana/Castelló de la Plana', 'Los canalones están llenos de hojas y en la última tormenta se desbordaron.'),

  -- ── Ceuta ──
  ( 67, 'servicio' , 'Salvador K.' , 'Suelos y parquet'                         ,  33, 'Ceuta'                                     , 'Instalación de laminado y vinílico, acuchillado y barnizado de parquet antiguo.'),
  ( 68, 'servicio' , 'Lorena M.'   , 'Ventanas y cristalería'                   ,  38, 'Ceuta'                                     , 'Ventanas de aluminio y PVC, doble acristalamiento y cambio de cristales rotos.'),
  ( 69, 'servicio' , 'Rosa M.'     , 'Persianas y toldos'                       ,  30, 'Ceuta'                                     , 'Persianas que no suben, cintas, motores y toldos de terraza. Reparación y cambio.'),
  ( 70, 'cliente'  , 'Soledad M.'  , 'Montaje de muebles'                       ,  24, 'Ceuta'                                     , 'Tengo tres cajas de un armario en el pasillo desde hace un mes.'),
  ( 71, 'cliente'  , 'Ismael R.'   , 'Mudanzas'                                 ,  30, 'Ceuta'                                     , 'Me mudo dentro del mismo pueblo. Piso de dos habitaciones, con ascensor en los dos.'),
  ( 72, 'cliente'  , 'Olga R.'     , 'Portes y transporte'                      ,  26, 'Ceuta'                                     , 'He comprado un sofá de segunda mano y no tengo cómo traerlo.'),

  -- ── Ciudad Real ──
  ( 73, 'servicio' , 'Julián P.'   , 'Reformas integrales'                      ,  40, 'Ciudad Real'                               , 'Reforma completa de cocinas y baños, con todos los gremios coordinados por mí.'),
  ( 74, 'servicio' , 'Sara P.'     , 'Jardinería'                               ,  22, 'Ciudad Real'                               , 'Siega, poda, setos y riego automático. Mantenimiento mensual o trabajo suelto.'),
  ( 75, 'servicio' , 'Héctor P.'   , 'Piscinas'                                 ,  30, 'Ciudad Real'                               , 'Puesta a punto de primavera, tratamiento del agua y reparación de depuradoras.'),
  ( 76, 'cliente'  , 'Silvia C.'   , 'Tapicería'                                ,  28, 'Ciudad Real'                               , 'Tengo dos sillones buenos de mi madre y quiero tapizarlos en vez de tirarlos.'),
  ( 77, 'cliente'  , 'Alberto C.'  , 'Vaciado de pisos'                         ,  27, 'Ciudad Real'                               , 'Hay que vaciar la casa de mis padres. Sin prisa y con cuidado con lo que hay dentro.'),
  ( 78, 'cliente'  , 'Borja C.'    , 'Cuidado de mayores'                       ,  15, 'Ciudad Real'                               , 'Busco acompañamiento para mi padre por las mañanas, tres días por semana.'),

  -- ── Cuenca ──
  ( 79, 'servicio' , 'Hugo S.'     , 'Limpieza de tejados y canalones'          ,  35, 'Cuenca'                                    , 'Canalones atascados, tejas rotas y musgo. Trabajo en altura con línea de vida.'),
  ( 80, 'servicio' , 'Marina S.'   , 'Montaje de muebles'                       ,  24, 'Cuenca'                                    , 'Monto armarios, cocinas y estanterías de cualquier tienda. Traigo mis herramientas.'),
  ( 81, 'servicio' , 'Candela S.'  , 'Mudanzas'                                 ,  30, 'Cuenca'                                    , 'Mudanzas de piso completo con furgón y dos personas. Embalaje si lo necesitas.'),
  ( 82, 'cliente'  , 'Miriam L.'   , 'Cuidado de niños'                         ,  13, 'Cuenca'                                    , 'Necesito que recojan a los niños del colegio dos tardes por semana.'),
  ( 83, 'cliente'  , 'Mónica L.'   , 'Cuidado de mascotas'                      ,  12, 'Cuenca'                                    , 'Dos paseos al día para mi perra las semanas que viajo por trabajo.'),
  ( 84, 'cliente'  , 'Elena D.'    , 'Reparaciones generales'                   ,  26, 'Cuenca'                                    , 'Tengo una lista de diez chapuzas pequeñas por toda la casa.'),

  -- ── Cáceres ──
  ( 85, 'servicio' , 'Manuel D.'   , 'Portes y transporte'                      ,  26, 'Cáceres'                                   , 'Portes pequeños, recogida de compras voluminosas y viajes al punto limpio.'),
  ( 86, 'servicio' , 'Nieves D.'   , 'Tapicería'                                ,  28, 'Cáceres'                                   , 'Tapizo sofás, sillas y cabeceros. Puedes elegir la tela o traerla tú.'),
  ( 87, 'servicio' , 'Marcos V.'   , 'Vaciado de pisos'                         ,  27, 'Cáceres'                                   , 'Vaciado completo de viviendas y trasteros, con separación de lo aprovechable.'),
  ( 88, 'cliente'  , 'Nicolás V.'  , 'Costura y arreglos de ropa'               ,  14, 'Cáceres'                                   , 'Unos pantalones para coger bajos y una cremallera de cazadora.'),
  ( 89, 'cliente'  , 'Noa V.'      , 'Cocina a domicilio'                       ,  28, 'Cáceres'                                   , 'Cena de cumpleaños en casa para doce personas. Prefiero no cocinar ese día.'),
  ( 90, 'cliente'  , 'Cristina G.' , 'Clases particulares'                      ,  18, 'Cáceres'                                   , 'Mi hija va floja en matemáticas de tercero de la ESO.'),

  -- ── Cádiz ──
  ( 91, 'servicio' , 'Mateo G.'    , 'Cuidado de mayores'                       ,  15, 'Jerez de la Frontera'                      , 'Acompañamiento, aseo y comidas. Experiencia con personas con movilidad reducida.'),
  ( 92, 'servicio' , 'Beatriz T.'  , 'Cuidado de niños'                         ,  13, 'Jerez de la Frontera'                      , 'Recogida del colegio, meriendas y deberes. Disponible por las tardes.'),
  ( 93, 'servicio' , 'Javier T.'   , 'Cuidado de mascotas'                      ,  12, 'Jerez de la Frontera'                      , 'Paseos diarios y visitas a domicilio cuando te vas de viaje. Perros y gatos.'),
  ( 94, 'cliente'  , 'Carla T.'    , 'Peluquería y estética a domicilio'        ,  22, 'Jerez de la Frontera'                      , 'Salgo poco de casa y me vendría bien que vinieran a cortarme el pelo.'),
  ( 95, 'cliente'  , 'Diego N.'    , 'Limpieza'                                 ,  14, 'Jerez de la Frontera'                      , 'Busco a alguien para el piso dos mañanas por semana. Somos tres en casa y un perro.'),
  ( 96, 'cliente'  , 'Celia N.'    , 'Limpieza de cristales'                    ,  16, 'Jerez de la Frontera'                      , 'Tengo un ventanal grande al que no llego y da a un patio interior.'),

  -- ── Córdoba ──
  ( 97, 'servicio' , 'Gabriel N.'  , 'Reparaciones generales'                   ,  26, 'Córdoba'                                   , 'Ese arreglo pequeño que llevas meses posponiendo: cuadros, silicona, bisagras, grifos.'),
  ( 98, 'servicio' , 'Teresa A.'   , 'Costura y arreglos de ropa'               ,  14, 'Córdoba'                                   , 'Bajos, cremalleras, ajustes de talla y arreglo de cortinas.'),
  ( 99, 'servicio' , 'Joaquín A.'  , 'Cocina a domicilio'                       ,  28, 'Córdoba'                                   , 'Cocino en tu casa para cenas y celebraciones, o dejo la semana preparada en tápers.'),
  (100, 'cliente'  , 'Marta B.'    , 'Limpieza de fin de obra'                  ,  18, 'Córdoba'                                   , 'Acabamos de reformar la cocina y aquello está lleno de polvo de yeso.'),
  (101, 'cliente'  , 'Fernando B.' , 'Planchado y lavandería'                   ,  12, 'Córdoba'                                   , 'Necesito que alguien se lleve la plancha de la semana. Camisas sobre todo.'),
  (102, 'cliente'  , 'Guillermo B.', 'Control de plagas'                        ,  35, 'Córdoba'                                   , 'Han salido cucarachas en el bajo del edificio y quiero tratarlo antes del verano.'),

  -- ── Gipuzkoa ──
  (103, 'servicio' , 'Rubén Q.'    , 'Clases particulares'                      ,  18, 'Donostia/San Sebastián'                    , 'Matemáticas y física de secundaria y bachillerato. A domicilio o en biblioteca.'),
  (104, 'servicio' , 'Pilar Q.'    , 'Peluquería y estética a domicilio'        ,  22, 'Donostia/San Sebastián'                    , 'Corte, color y manicura en tu casa. Muy cómodo si te cuesta salir.'),
  (105, 'servicio' , 'Ainhoa Q.'   , 'Limpieza'                                 ,  11, 'Donostia/San Sebastián'                    , 'Puedo ir un día suelto o venir fija cada semana. Lo que necesites.'),
  (106, 'cliente'  , 'Sonia F.'    , 'Alquiler de robot aspirador'              ,  18, 'Donostia/San Sebastián'                    , 'Quiero probar uno una semana antes de decidir si me compro el mío.'),
  (107, 'cliente'  , 'Aitor F.'    , 'Alquiler de robot fregasuelos'            ,  22, 'Donostia/San Sebastián'                    , 'Me he roto un pie y necesito apañarme unas semanas sin fregar a mano.'),
  (108, 'cliente'  , 'Unai F.'     , 'Alquiler de robot limpiacristales'        ,  21, 'Donostia/San Sebastián'                    , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Girona ──
  (109, 'servicio' , 'Emilio H.'   , 'Limpieza de cristales'                    ,  16, 'Girona'                                    , 'Me organizo sola, no hace falta que estés en casa mientras tanto.'),
  (110, 'servicio' , 'Arturo H.'   , 'Limpieza de fin de obra'                  ,  17, 'Girona'                                    , 'Tengo referencias de las casas donde llevo tiempo, por si las quieres.'),
  (111, 'servicio' , 'Sergio J.'   , 'Planchado y lavandería'                   ,  10, 'Girona'                                    , 'Puedo ir un día suelto o venir fija cada semana. Lo que necesites.'),
  (112, 'cliente'  , 'Laura J.'    , 'Alquiler de robot limpiafondos de piscina',  27, 'Girona'                                    , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (113, 'cliente'  , 'Emma J.'     , 'Alquiler de robot cortacésped'            ,  31, 'Girona'                                    , 'Quiero probarlo antes de decidir si me compro uno.'),
  (114, 'cliente'  , 'Irene E.'    , 'Alquiler de aspirador industrial'         ,  27, 'Girona'                                    , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Granada ──
  (115, 'servicio' , 'Amparo E.'   , 'Control de plagas'                        ,  36, 'Granada'                                   , 'Me organizo sola, no hace falta que estés en casa mientras tanto.'),
  (116, 'servicio' , 'Ernesto E.'  , 'Alquiler de robot aspirador'              ,  18, 'Granada'                                   , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (117, 'servicio' , 'Adrián Z.'   , 'Alquiler de robot fregasuelos'            ,  21, 'Granada'                                   , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (118, 'cliente'  , 'Susana Z.'   , 'Alquiler de máquina de vapor'             ,  22, 'Granada'                                   , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (119, 'cliente'  , 'Álvaro I.'   , 'Alquiler de hidrolimpiadora'              ,  23, 'Granada'                                   , 'Quiero probarlo antes de decidir si me compro uno.'),
  (120, 'cliente'  , 'Inés I.'     , 'Alquiler de abrillantadora de suelos'     ,  35, 'Granada'                                   , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Guadalajara ──
  (121, 'servicio' , 'Ignacio I.'  , 'Alquiler de robot limpiacristales'        ,  22, 'Guadalajara'                               , 'Tengo más de uno, así que casi siempre hay libre.'),
  (122, 'servicio' , 'Carmen O.'   , 'Alquiler de robot limpiafondos de piscina',  31, 'Guadalajara'                               , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (123, 'servicio' , 'Ramón O.'    , 'Alquiler de robot cortacésped'            ,  28, 'Guadalajara'                               , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (124, 'cliente'  , 'Valeria O.'  , 'Alquiler de limpiamoquetas'               ,  26, 'Guadalajara'                               , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (125, 'cliente'  , 'Raúl U.'     , 'Alquiler de deshumidificador'             ,  13, 'Guadalajara'                               , 'Quiero probarlo antes de decidir si me compro uno.'),
  (126, 'cliente'  , 'Cecilia U.'  , 'Alquiler de generador eléctrico'          ,  37, 'Guadalajara'                               , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Huelva ──
  (127, 'servicio' , 'Rebeca U.'   , 'Alquiler de aspirador industrial'         ,  28, 'Huelva'                                    , 'Tengo más de uno, así que casi siempre hay libre.'),
  (128, 'servicio' , 'Lucía Y.'    , 'Alquiler de máquina de vapor'             ,  26, 'Huelva'                                    , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (129, 'servicio' , 'Ana Y.'      , 'Alquiler de hidrolimpiadora'              ,  27, 'Huelva'                                    , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (130, 'cliente'  , 'Paula X.'    , 'Alquiler de andamio o escalera'           ,  22, 'Huelva'                                    , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (131, 'cliente'  , 'Daniel X.'   , 'Alquiler de herramienta eléctrica'        ,  15, 'Huelva'                                    , 'Quiero probarlo antes de decidir si me compro uno.'),
  (132, 'cliente'  , 'Carolina X.' , 'Fontanería'                               ,  33, 'Huelva'                                    , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Huesca ──
  (133, 'servicio' , 'Gonzalo W.'  , 'Alquiler de abrillantadora de suelos'     ,  29, 'Huesca'                                    , 'Tengo más de uno, así que casi siempre hay libre.'),
  (134, 'servicio' , 'Bruno W.'    , 'Alquiler de limpiamoquetas'               ,  30, 'Huesca'                                    , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (135, 'servicio' , 'Jimena W.'   , 'Alquiler de deshumidificador'             ,  17, 'Huesca'                                    , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (136, 'cliente'  , 'Patricia K.' , 'Electricidad'                             ,  39, 'Huesca'                                    , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (137, 'cliente'  , 'Samuel K.'   , 'Calefacción y calderas'                   ,  42, 'Huesca'                                    , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (138, 'cliente'  , 'Rocío M.'    , 'Aire acondicionado'                       ,  39, 'Huesca'                                    , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Illes Balears ──
  (139, 'servicio' , 'Antonio M.'  , 'Alquiler de generador eléctrico'          ,  38, 'Palma de Mallorca'                         , 'Tengo más de uno, así que casi siempre hay libre.'),
  (140, 'servicio' , 'Gloria M.'   , 'Alquiler de andamio o escalera'           ,  19, 'Palma de Mallorca'                         , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (141, 'servicio' , 'Tomás R.'    , 'Alquiler de herramienta eléctrica'        ,  19, 'Palma de Mallorca'                         , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (142, 'cliente'  , 'Víctor R.'   , 'Cerrajería'                               ,  47, 'Palma de Mallorca'                         , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (143, 'cliente'  , 'Lidia R.'    , 'Desatascos'                               ,  45, 'Palma de Mallorca'                         , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (144, 'cliente'  , 'Noelia P.'   , 'Reparación de electrodomésticos'          ,  33, 'Palma de Mallorca'                         , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Jaén ──
  (145, 'servicio' , 'Enrique P.'  , 'Fontanería'                               ,  34, 'Jaén'                                      , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (146, 'servicio' , 'Nuria C.'    , 'Electricidad'                             ,  36, 'Jaén'                                      , 'Presupuesto cerrado antes de tocar nada.'),
  (147, 'servicio' , 'Pablo C.'    , 'Calefacción y calderas'                   ,  39, 'Jaén'                                      , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (148, 'cliente'  , 'Alba C.'     , 'Antenas y televisión'                     ,  33, 'Jaén'                                      , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (149, 'cliente'  , 'Andrés S.'   , 'Informática y redes'                      ,  30, 'Jaén'                                      , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (150, 'cliente'  , 'Natalia S.'  , 'Placas solares'                           ,  49, 'Jaén'                                      , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── La Rioja ──
  (151, 'servicio' , 'Martín S.'   , 'Aire acondicionado'                       ,  40, 'Logroño'                                   , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (152, 'servicio' , 'Alicia L.'   , 'Cerrajería'                               ,  44, 'Logroño'                                   , 'Presupuesto cerrado antes de tocar nada.'),
  (153, 'servicio' , 'Félix L.'    , 'Desatascos'                               ,  42, 'Logroño'                                   , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (154, 'cliente'  , 'Mario L.'    , 'Albañilería'                              ,  31, 'Logroño'                                   , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (155, 'cliente'  , 'Ángel D.'    , 'Pintura'                                  ,  28, 'Logroño'                                   , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (156, 'cliente'  , 'Lorenzo D.'  , 'Carpintería'                              ,  38, 'Logroño'                                   , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── Las Palmas ──
  (157, 'servicio' , 'Óscar V.'    , 'Reparación de electrodomésticos'          ,  34, 'Las Palmas de Gran Canaria'                , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (158, 'servicio' , 'Eva V.'      , 'Antenas y televisión'                     ,  30, 'Las Palmas de Gran Canaria'                , 'Presupuesto cerrado antes de tocar nada.'),
  (159, 'servicio' , 'Lucas V.'    , 'Informática y redes'                      ,  27, 'Las Palmas de Gran Canaria'                , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (160, 'cliente'  , 'Vanesa G.'   , 'Escayola y pladur'                        ,  30, 'Las Palmas de Gran Canaria'                , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (161, 'cliente'  , 'Yolanda G.'  , 'Suelos y parquet'                         ,  30, 'Las Palmas de Gran Canaria'                , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (162, 'cliente'  , 'Iker G.'     , 'Ventanas y cristalería'                   ,  41, 'Las Palmas de Gran Canaria'                , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── León ──
  (163, 'servicio' , 'Jorge T.'    , 'Placas solares'                           ,  50, 'León'                                      , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (164, 'servicio' , 'Belén T.'    , 'Albañilería'                              ,  35, 'León'                                      , 'Si hace falta, coordino yo a los demás gremios.'),
  (165, 'servicio' , 'Iván N.'     , 'Pintura'                                  ,  25, 'León'                                      , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (166, 'cliente'  , 'Clara N.'    , 'Persianas y toldos'                       ,  29, 'León'                                      , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (167, 'cliente'  , 'Salvador N.' , 'Reformas integrales'                      ,  38, 'León'                                      , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (168, 'cliente'  , 'Lorena A.'   , 'Jardinería'                               ,  19, 'León'                                      , 'Es una parcela pequeña, con sitio de sobra para trabajar.'),

  -- ── Lleida ──
  (169, 'servicio' , 'Rosa A.'     , 'Carpintería'                              ,  39, 'Lleida'                                    , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (170, 'servicio' , 'Soledad A.'  , 'Escayola y pladur'                        ,  34, 'Lleida'                                    , 'Si hace falta, coordino yo a los demás gremios.'),
  (171, 'servicio' , 'Ismael B.'   , 'Suelos y parquet'                         ,  34, 'Lleida'                                    , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (172, 'cliente'  , 'Olga B.'     , 'Piscinas'                                 ,  30, 'Lleida'                                    , 'Lo tengo abandonado desde hace un par de temporadas.'),
  (173, 'cliente'  , 'Julián Q.'   , 'Limpieza de tejados y canalones'          ,  34, 'Lleida'                                    , 'Busco a alguien que lo lleve cada cierto tiempo, no una cosa suelta.'),
  (174, 'cliente'  , 'Sara Q.'     , 'Montaje de muebles'                       ,  22, 'Lleida'                                    , 'Es poca cosa, pero yo solo no puedo con ello.'),

  -- ── Lugo ──
  (175, 'servicio' , 'Héctor Q.'   , 'Ventanas y cristalería'                   ,  35, 'Lugo'                                      , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (176, 'servicio' , 'Silvia F.'   , 'Persianas y toldos'                       ,  33, 'Lugo'                                      , 'Si hace falta, coordino yo a los demás gremios.'),
  (177, 'servicio' , 'Alberto F.'  , 'Reformas integrales'                      ,  42, 'Lugo'                                      , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (178, 'cliente'  , 'Borja F.'    , 'Mudanzas'                                 ,  31, 'Lugo'                                      , 'Me viene bien cualquier día, fin de semana incluido.'),
  (179, 'cliente'  , 'Hugo H.'     , 'Portes y transporte'                      ,  26, 'Lugo'                                      , 'Hay que subir a un tercero sin ascensor, lo aviso por delante.'),
  (180, 'cliente'  , 'Marina H.'   , 'Tapicería'                                ,  27, 'Lugo'                                      , 'Es poca cosa, pero yo solo no puedo con ello.'),

  -- ── Madrid ──
  (181, 'servicio' , 'Candela H.'  , 'Jardinería'                               ,  20, 'Madrid'                                    , 'Tengo seguro de responsabilidad civil al día.'),
  (182, 'servicio' , 'Miriam J.'   , 'Piscinas'                                 ,  27, 'Madrid'                                    , 'Mejor hacerlo antes de que llegue el mal tiempo, se nota mucho.'),
  (183, 'servicio' , 'Mónica J.'   , 'Limpieza de tejados y canalones'          ,  38, 'Madrid'                                    , 'Paso a verlo sin coste y te digo qué haría y lo que cuesta.'),
  (184, 'cliente'  , 'Elena E.'    , 'Vaciado de pisos'                         ,  29, 'Madrid'                                    , 'Me viene bien cualquier día, fin de semana incluido.'),
  (185, 'cliente'  , 'Manuel E.'   , 'Cuidado de mayores'                       ,  16, 'Madrid'                                    , 'Serían unas horas fijas entre semana, siempre las mismas.'),
  (186, 'cliente'  , 'Nieves E.'   , 'Cuidado de niños'                         ,  13, 'Madrid'                                    , 'Busco a alguien de confianza y con paciencia, es lo que más valoro.'),

  -- ── Melilla ──
  (187, 'servicio' , 'Marcos Z.'   , 'Montaje de muebles'                       ,  23, 'Melilla'                                   , 'Si hay que subir sin ascensor lo hablamos, pero se hace.'),
  (188, 'servicio' , 'Nicolás Z.'  , 'Mudanzas'                                 ,  28, 'Melilla'                                   , 'Te doy precio cerrado si me dices los metros y la planta.'),
  (189, 'servicio' , 'Noa Z.'      , 'Portes y transporte'                      ,  23, 'Melilla'                                   , 'Puedo un sábado o un domingo, sin recargo.'),
  (190, 'cliente'  , 'Cristina I.' , 'Cuidado de mascotas'                      ,  15, 'Melilla'                                   , 'Me gustaría que nos conociéramos antes de empezar.'),
  (191, 'cliente'  , 'Mateo I.'    , 'Reparaciones generales'                   ,  28, 'Melilla'                                   , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (192, 'cliente'  , 'Beatriz O.'  , 'Costura y arreglos de ropa'               ,  15, 'Melilla'                                   , 'Cuéntame si es algo que haces y cuánto me costaría.'),

  -- ── Murcia ──
  (193, 'servicio' , 'Javier O.'   , 'Tapicería'                                ,  28, 'Murcia'                                    , 'Si hay que subir sin ascensor lo hablamos, pero se hace.'),
  (194, 'servicio' , 'Carla O.'    , 'Vaciado de pisos'                         ,  26, 'Murcia'                                    , 'Te doy precio cerrado si me dices los metros y la planta.'),
  (195, 'servicio' , 'Diego U.'    , 'Cuidado de mayores'                       ,  13, 'Murcia'                                    , 'Puedo acompañar a citas médicas o a donde haga falta.'),
  (196, 'cliente'  , 'Celia U.'    , 'Cocina a domicilio'                       ,  25, 'Murcia'                                    , 'No tengo prisa, puedo esperar a que tengas hueco.'),
  (197, 'cliente'  , 'Gabriel U.'  , 'Clases particulares'                      ,  21, 'Murcia'                                    , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (198, 'cliente'  , 'Teresa Y.'   , 'Peluquería y estética a domicilio'        ,  24, 'Murcia'                                    , 'Cuéntame si es algo que haces y cuánto me costaría.'),

  -- ── Málaga ──
  (199, 'servicio' , 'Joaquín Y.'  , 'Cuidado de niños'                         ,  14, 'Málaga'                                    , 'Prefiero que nos conozcamos antes con una visita, sin compromiso.'),
  (200, 'servicio' , 'Marta X.'    , 'Cuidado de mascotas'                      ,  12, 'Málaga'                                    , 'Tengo formación en primeros auxilios.'),
  (201, 'servicio' , 'Fernando X.' , 'Reparaciones generales'                   ,  25, 'Málaga'                                    , 'Precio cerrado antes de empezar, sin sorpresas al final.'),
  (202, 'cliente'  , 'Guillermo X.', 'Limpieza'                                 ,  12, 'Málaga'                                    , 'Prefiero que venga siempre la misma persona y no una distinta cada vez.'),
  (203, 'cliente'  , 'Rubén W.'    , 'Limpieza de cristales'                    ,  13, 'Málaga'                                    , 'Busco a alguien de confianza, porque no siempre voy a estar en casa.'),
  (204, 'cliente'  , 'Pilar W.'    , 'Limpieza de fin de obra'                  ,  21, 'Málaga'                                    , 'Es un piso normal, nada del otro mundo. Quiero dejarlo a punto.'),

  -- ── Navarra ──
  (205, 'servicio' , 'Ainhoa W.'   , 'Costura y arreglos de ropa'               ,  16, 'Pamplona/Iruña'                            , 'Si es poca cosa lo digo y cobro poco. No me invento faena.'),
  (206, 'servicio' , 'Sonia K.'    , 'Cocina a domicilio'                       ,  29, 'Pamplona/Iruña'                            , 'Tengo hueco esta semana, también por las tardes.'),
  (207, 'servicio' , 'Aitor K.'    , 'Clases particulares'                      ,  18, 'Pamplona/Iruña'                            , 'Precio cerrado antes de empezar, sin sorpresas al final.'),
  (208, 'cliente'  , 'Unai K.'     , 'Planchado y lavandería'                   ,  11, 'Pamplona/Iruña'                            , 'Prefiero que venga siempre la misma persona y no una distinta cada vez.'),
  (209, 'cliente'  , 'Emilio M.'   , 'Control de plagas'                        ,  33, 'Pamplona/Iruña'                            , 'Busco a alguien de confianza, porque no siempre voy a estar en casa.'),
  (210, 'cliente'  , 'Arturo M.'   , 'Alquiler de robot aspirador'              ,  15, 'Pamplona/Iruña'                            , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Ourense ──
  (211, 'servicio' , 'Sergio R.'   , 'Peluquería y estética a domicilio'        ,  25, 'Ourense'                                   , 'Si es poca cosa lo digo y cobro poco. No me invento faena.'),
  (212, 'servicio' , 'Laura R.'    , 'Limpieza'                                 ,  16, 'Ourense'                                   , 'Tengo referencias de las casas donde llevo tiempo, por si las quieres.'),
  (213, 'servicio' , 'Emma R.'     , 'Limpieza de cristales'                    ,  17, 'Ourense'                                   , 'Puedo ir un día suelto o venir fija cada semana. Lo que necesites.'),
  (214, 'cliente'  , 'Irene P.'    , 'Alquiler de robot fregasuelos'            ,  22, 'Ourense'                                   , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (215, 'cliente'  , 'Amparo P.'   , 'Alquiler de robot limpiacristales'        ,  19, 'Ourense'                                   , 'Quiero probarlo antes de decidir si me compro uno.'),
  (216, 'cliente'  , 'Ernesto P.'  , 'Alquiler de robot limpiafondos de piscina',  28, 'Ourense'                                   , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Palencia ──
  (217, 'servicio' , 'Adrián C.'   , 'Limpieza de fin de obra'                  ,  15, 'Palencia'                                  , 'Me organizo sola, no hace falta que estés en casa mientras tanto.'),
  (218, 'servicio' , 'Susana C.'   , 'Planchado y lavandería'                   ,  15, 'Palencia'                                  , 'Tengo referencias de las casas donde llevo tiempo, por si las quieres.'),
  (219, 'servicio' , 'Álvaro S.'   , 'Control de plagas'                        ,  37, 'Palencia'                                  , 'Puedo ir un día suelto o venir fija cada semana. Lo que necesites.'),
  (220, 'cliente'  , 'Inés S.'     , 'Alquiler de robot cortacésped'            ,  29, 'Palencia'                                  , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (221, 'cliente'  , 'Ignacio S.'  , 'Alquiler de aspirador industrial'         ,  25, 'Palencia'                                  , 'Quiero probarlo antes de decidir si me compro uno.'),
  (222, 'cliente'  , 'Carmen L.'   , 'Alquiler de máquina de vapor'             ,  23, 'Palencia'                                  , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Pontevedra ──
  (223, 'servicio' , 'Ramón L.'    , 'Alquiler de robot aspirador'              ,  16, 'Vigo'                                      , 'Tengo más de uno, así que casi siempre hay libre.'),
  (224, 'servicio' , 'Valeria L.'  , 'Alquiler de robot fregasuelos'            ,  19, 'Vigo'                                      , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (225, 'servicio' , 'Raúl D.'     , 'Alquiler de robot limpiacristales'        ,  23, 'Vigo'                                      , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (226, 'cliente'  , 'Cecilia D.'  , 'Alquiler de hidrolimpiadora'              ,  28, 'Vigo'                                      , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (227, 'cliente'  , 'Rebeca D.'   , 'Alquiler de abrillantadora de suelos'     ,  33, 'Vigo'                                      , 'Quiero probarlo antes de decidir si me compro uno.'),
  (228, 'cliente'  , 'Lucía V.'    , 'Alquiler de limpiamoquetas'               ,  27, 'Vigo'                                      , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Salamanca ──
  (229, 'servicio' , 'Ana V.'      , 'Alquiler de robot limpiafondos de piscina',  29, 'Salamanca'                                 , 'Tengo más de uno, así que casi siempre hay libre.'),
  (230, 'servicio' , 'Paula G.'    , 'Alquiler de robot cortacésped'            ,  26, 'Salamanca'                                 , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (231, 'servicio' , 'Daniel G.'   , 'Alquiler de aspirador industrial'         ,  22, 'Salamanca'                                 , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (232, 'cliente'  , 'Carolina G.' , 'Alquiler de deshumidificador'             ,  18, 'Salamanca'                                 , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (233, 'cliente'  , 'Gonzalo T.'  , 'Alquiler de generador eléctrico'          ,  42, 'Salamanca'                                 , 'Quiero probarlo antes de decidir si me compro uno.'),
  (234, 'cliente'  , 'Bruno T.'    , 'Alquiler de andamio o escalera'           ,  23, 'Salamanca'                                 , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Santa Cruz de Tenerife ──
  (235, 'servicio' , 'Jimena T.'   , 'Alquiler de máquina de vapor'             ,  24, 'Santa Cruz de Tenerife'                    , 'Tengo más de uno, así que casi siempre hay libre.'),
  (236, 'servicio' , 'Patricia N.' , 'Alquiler de hidrolimpiadora'              ,  25, 'Santa Cruz de Tenerife'                    , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (237, 'servicio' , 'Samuel N.'   , 'Alquiler de abrillantadora de suelos'     ,  30, 'Santa Cruz de Tenerife'                    , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (238, 'cliente'  , 'Rocío A.'    , 'Alquiler de herramienta eléctrica'        ,  13, 'Santa Cruz de Tenerife'                    , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (239, 'cliente'  , 'Antonio A.'  , 'Fontanería'                               ,  38, 'Santa Cruz de Tenerife'                    , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (240, 'cliente'  , 'Gloria A.'   , 'Electricidad'                             ,  40, 'Santa Cruz de Tenerife'                    , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Segovia ──
  (241, 'servicio' , 'Tomás B.'    , 'Alquiler de limpiamoquetas'               ,  28, 'Segovia'                                   , 'Tengo más de uno, así que casi siempre hay libre.'),
  (242, 'servicio' , 'Víctor B.'   , 'Alquiler de deshumidificador'             ,  15, 'Segovia'                                   , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (243, 'servicio' , 'Lidia B.'    , 'Alquiler de generador eléctrico'          ,  39, 'Segovia'                                   , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (244, 'cliente'  , 'Noelia Q.'   , 'Calefacción y calderas'                   ,  40, 'Segovia'                                   , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (245, 'cliente'  , 'Enrique Q.'  , 'Aire acondicionado'                       ,  37, 'Segovia'                                   , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (246, 'cliente'  , 'Nuria F.'    , 'Cerrajería'                               ,  48, 'Segovia'                                   , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Sevilla ──
  (247, 'servicio' , 'Pablo F.'    , 'Alquiler de andamio o escalera'           ,  24, 'Sevilla'                                   , 'Tengo más de uno, así que casi siempre hay libre.'),
  (248, 'servicio' , 'Alba F.'     , 'Alquiler de herramienta eléctrica'        ,  17, 'Sevilla'                                   , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (249, 'servicio' , 'Andrés H.'   , 'Fontanería'                               ,  35, 'Sevilla'                                   , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (250, 'cliente'  , 'Natalia H.'  , 'Desatascos'                               ,  43, 'Sevilla'                                   , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (251, 'cliente'  , 'Martín H.'   , 'Reparación de electrodomésticos'          ,  31, 'Sevilla'                                   , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (252, 'cliente'  , 'Alicia J.'   , 'Antenas y televisión'                     ,  27, 'Sevilla'                                   , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Soria ──
  (253, 'servicio' , 'Félix J.'    , 'Electricidad'                             ,  41, 'Soria'                                     , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (254, 'servicio' , 'Mario J.'    , 'Calefacción y calderas'                   ,  44, 'Soria'                                     , 'Presupuesto cerrado antes de tocar nada.'),
  (255, 'servicio' , 'Ángel E.'    , 'Aire acondicionado'                       ,  41, 'Soria'                                     , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (256, 'cliente'  , 'Lorenzo E.'  , 'Informática y redes'                      ,  28, 'Soria'                                     , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (257, 'cliente'  , 'Óscar Z.'    , 'Placas solares'                           ,  47, 'Soria'                                     , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (258, 'cliente'  , 'Eva Z.'      , 'Albañilería'                              ,  32, 'Soria'                                     , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── Tarragona ──
  (259, 'servicio' , 'Lucas Z.'    , 'Cerrajería'                               ,  42, 'Tarragona'                                 , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (260, 'servicio' , 'Vanesa I.'   , 'Desatascos'                               ,  47, 'Tarragona'                                 , 'Presupuesto cerrado antes de tocar nada.'),
  (261, 'servicio' , 'Yolanda I.'  , 'Reparación de electrodomésticos'          ,  35, 'Tarragona'                                 , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (262, 'cliente'  , 'Iker I.'     , 'Pintura'                                  ,  26, 'Tarragona'                                 , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (263, 'cliente'  , 'Jorge O.'    , 'Carpintería'                              ,  36, 'Tarragona'                                 , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (264, 'cliente'  , 'Belén O.'    , 'Escayola y pladur'                        ,  31, 'Tarragona'                                 , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── Teruel ──
  (265, 'servicio' , 'Iván U.'     , 'Antenas y televisión'                     ,  28, 'Teruel'                                    , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (266, 'servicio' , 'Clara U.'    , 'Informática y redes'                      ,  25, 'Teruel'                                    , 'Presupuesto cerrado antes de tocar nada.'),
  (267, 'servicio' , 'Salvador U.' , 'Placas solares'                           ,  51, 'Teruel'                                    , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (268, 'cliente'  , 'Lorena Y.'   , 'Suelos y parquet'                         ,  35, 'Teruel'                                    , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (269, 'cliente'  , 'Rosa Y.'     , 'Ventanas y cristalería'                   ,  39, 'Teruel'                                    , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (270, 'cliente'  , 'Soledad Y.'  , 'Persianas y toldos'                       ,  30, 'Teruel'                                    , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── Toledo ──
  (271, 'servicio' , 'Ismael X.'   , 'Albañilería'                              ,  33, 'Toledo'                                    , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (272, 'servicio' , 'Olga X.'     , 'Pintura'                                  ,  23, 'Toledo'                                    , 'Si hace falta, coordino yo a los demás gremios.'),
  (273, 'servicio' , 'Julián W.'   , 'Carpintería'                              ,  33, 'Toledo'                                    , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (274, 'cliente'  , 'Sara W.'     , 'Reformas integrales'                      ,  43, 'Toledo'                                    , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (275, 'cliente'  , 'Héctor W.'   , 'Jardinería'                               ,  24, 'Toledo'                                    , 'Busco a alguien que lo lleve cada cierto tiempo, no una cosa suelta.'),
  (276, 'cliente'  , 'Silvia K.'   , 'Piscinas'                                 ,  31, 'Toledo'                                    , 'Es una parcela pequeña, con sitio de sobra para trabajar.'),

  -- ── Valencia ──
  (277, 'servicio' , 'Alberto K.'  , 'Escayola y pladur'                        ,  32, 'Valencia'                                  , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (278, 'servicio' , 'Borja K.'    , 'Suelos y parquet'                         ,  32, 'Valencia'                                  , 'Si hace falta, coordino yo a los demás gremios.'),
  (279, 'servicio' , 'Hugo M.'     , 'Ventanas y cristalería'                   ,  36, 'Valencia'                                  , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (280, 'cliente'  , 'Marina M.'   , 'Limpieza de tejados y canalones'          ,  32, 'Valencia'                                  , 'Lo tengo abandonado desde hace un par de temporadas.'),
  (281, 'cliente'  , 'Candela M.'  , 'Montaje de muebles'                       ,  27, 'Valencia'                                  , 'Hay que subir a un tercero sin ascensor, lo aviso por delante.'),
  (282, 'cliente'  , 'Miriam R.'   , 'Mudanzas'                                 ,  32, 'Valencia'                                  , 'Es poca cosa, pero yo solo no puedo con ello.'),

  -- ── Valladolid ──
  (283, 'servicio' , 'Mónica R.'   , 'Persianas y toldos'                       ,  31, 'Valladolid'                                , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (284, 'servicio' , 'Elena P.'    , 'Reformas integrales'                      ,  40, 'Valladolid'                                , 'Si hace falta, coordino yo a los demás gremios.'),
  (285, 'servicio' , 'Manuel P.'   , 'Jardinería'                               ,  21, 'Valladolid'                                , 'Paso a verlo sin coste y te digo qué haría y lo que cuesta.'),
  (286, 'cliente'  , 'Nieves P.'   , 'Portes y transporte'                      ,  24, 'Valladolid'                                , 'Me viene bien cualquier día, fin de semana incluido.'),
  (287, 'cliente'  , 'Marcos C.'   , 'Tapicería'                                ,  25, 'Valladolid'                                , 'Hay que subir a un tercero sin ascensor, lo aviso por delante.'),
  (288, 'cliente'  , 'Nicolás C.'  , 'Vaciado de pisos'                         ,  30, 'Valladolid'                                , 'Es poca cosa, pero yo solo no puedo con ello.'),

  -- ── Zamora ──
  (289, 'servicio' , 'Noa C.'      , 'Piscinas'                                 ,  32, 'Zamora'                                    , 'Tengo seguro de responsabilidad civil al día.'),
  (290, 'servicio' , 'Cristina S.' , 'Limpieza de tejados y canalones'          ,  36, 'Zamora'                                    , 'Mejor hacerlo antes de que llegue el mal tiempo, se nota mucho.'),
  (291, 'servicio' , 'Mateo S.'    , 'Montaje de muebles'                       ,  24, 'Zamora'                                    , 'Puedo un sábado o un domingo, sin recargo.'),
  (292, 'cliente'  , 'Beatriz L.'  , 'Cuidado de mayores'                       ,  14, 'Zamora'                                    , 'Me gustaría que nos conociéramos antes de empezar.'),
  (293, 'cliente'  , 'Javier L.'   , 'Cuidado de niños'                         ,  11, 'Zamora'                                    , 'Serían unas horas fijas entre semana, siempre las mismas.'),
  (294, 'cliente'  , 'Carla L.'    , 'Cuidado de mascotas'                      ,   9, 'Zamora'                                    , 'Busco a alguien de confianza y con paciencia, es lo que más valoro.'),

  -- ── Zaragoza ──
  (295, 'servicio' , 'Diego D.'    , 'Mudanzas'                                 ,  33, 'Zaragoza'                                  , 'Si hay que subir sin ascensor lo hablamos, pero se hace.'),
  (296, 'servicio' , 'Celia D.'    , 'Portes y transporte'                      ,  28, 'Zaragoza'                                  , 'Te doy precio cerrado si me dices los metros y la planta.'),
  (297, 'servicio' , 'Gabriel D.'  , 'Tapicería'                                ,  29, 'Zaragoza'                                  , 'Puedo un sábado o un domingo, sin recargo.'),
  (298, 'cliente'  , 'Teresa V.'   , 'Reparaciones generales'                   ,  26, 'Zaragoza'                                  , 'No tengo prisa, puedo esperar a que tengas hueco.'),
  (299, 'cliente'  , 'Joaquín V.'  , 'Costura y arreglos de ropa'               ,  13, 'Zaragoza'                                  , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (300, 'cliente'  , 'Marta G.'    , 'Cocina a domicilio'                       ,  26, 'Zaragoza'                                  , 'Cuéntame si es algo que haces y cuánto me costaría.'),

  -- ── Álava ──
  (301, 'servicio' , 'Fernando G.' , 'Vaciado de pisos'                         ,  24, 'Vitoria-Gasteiz'                           , 'Si hay que subir sin ascensor lo hablamos, pero se hace.'),
  (302, 'servicio' , 'Guillermo G.', 'Cuidado de mayores'                       ,  18, 'Vitoria-Gasteiz'                           , 'Tengo formación en primeros auxilios.'),
  (303, 'servicio' , 'Rubén T.'    , 'Cuidado de niños'                         ,  15, 'Vitoria-Gasteiz'                           , 'Puedo acompañar a citas médicas o a donde haga falta.'),
  (304, 'cliente'  , 'Pilar T.'    , 'Clases particulares'                      ,  19, 'Vitoria-Gasteiz'                           , 'No tengo prisa, puedo esperar a que tengas hueco.'),
  (305, 'cliente'  , 'Ainhoa T.'   , 'Peluquería y estética a domicilio'        ,  22, 'Vitoria-Gasteiz'                           , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (306, 'cliente'  , 'Sonia N.'    , 'Limpieza'                                 ,  13, 'Vitoria-Gasteiz'                           , 'Es un piso normal, nada del otro mundo. Quiero dejarlo a punto.'),

  -- ── Ávila ──
  (307, 'servicio' , 'Aitor N.'    , 'Cuidado de mascotas'                      ,  10, 'Ávila'                                     , 'Prefiero que nos conozcamos antes con una visita, sin compromiso.'),
  (308, 'servicio' , 'Unai N.'     , 'Reparaciones generales'                   ,  23, 'Ávila'                                     , 'Tengo hueco esta semana, también por las tardes.'),
  (309, 'servicio' , 'Emilio A.'   , 'Costura y arreglos de ropa'               ,  17, 'Ávila'                                     , 'Precio cerrado antes de empezar, sin sorpresas al final.'),
  (310, 'cliente'  , 'Arturo A.'   , 'Limpieza de cristales'                    ,  18, 'Ávila'                                     , 'Prefiero que venga siempre la misma persona y no una distinta cada vez.'),
  (311, 'cliente'  , 'Sergio B.'   , 'Limpieza de fin de obra'                  ,  19, 'Ávila'                                     , 'Busco a alguien de confianza, porque no siempre voy a estar en casa.'),
  (312, 'cliente'  , 'Laura B.'    , 'Planchado y lavandería'                   ,  12, 'Ávila'                                     , 'Es un piso normal, nada del otro mundo. Quiero dejarlo a punto.')
)

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
    'ciudad',      g.municipio,
    'categoria',   g.categoria,
    'precio_hora', g.precio::text,
    'resumen',     g.resumen
  )
from gente g;


-- ── 3 · Lo que el trigger de alta no rellena ───────────────────────────
--
--  `trg_nuevo_usuario` sigue siendo el de 01_esquema.sql y solo conoce los
--  campos que existían entonces: no sabe de `provincia` ni de
--  `unidad_precio`, que llegaron en migraciones posteriores.

with provincias (provincia, municipio) as (values
  ('A Coruña'                    , 'A Coruña'),
  ('Albacete'                    , 'Albacete'),
  ('Alicante'                    , 'Alicante/Alacant'),
  ('Almería'                     , 'Almería'),
  ('Asturias'                    , 'Gijón'),
  ('Badajoz'                     , 'Badajoz'),
  ('Barcelona'                   , 'Barcelona'),
  ('Bizkaia'                     , 'Bilbao'),
  ('Burgos'                      , 'Burgos'),
  ('Cantabria'                   , 'Santander'),
  ('Castellón'                   , 'Castellón de la Plana/Castelló de la Plana'),
  ('Ceuta'                       , 'Ceuta'),
  ('Ciudad Real'                 , 'Ciudad Real'),
  ('Cuenca'                      , 'Cuenca'),
  ('Cáceres'                     , 'Cáceres'),
  ('Cádiz'                       , 'Jerez de la Frontera'),
  ('Córdoba'                     , 'Córdoba'),
  ('Gipuzkoa'                    , 'Donostia/San Sebastián'),
  ('Girona'                      , 'Girona'),
  ('Granada'                     , 'Granada'),
  ('Guadalajara'                 , 'Guadalajara'),
  ('Huelva'                      , 'Huelva'),
  ('Huesca'                      , 'Huesca'),
  ('Illes Balears'               , 'Palma de Mallorca'),
  ('Jaén'                        , 'Jaén'),
  ('La Rioja'                    , 'Logroño'),
  ('Las Palmas'                  , 'Las Palmas de Gran Canaria'),
  ('León'                        , 'León'),
  ('Lleida'                      , 'Lleida'),
  ('Lugo'                        , 'Lugo'),
  ('Madrid'                      , 'Madrid'),
  ('Melilla'                     , 'Melilla'),
  ('Murcia'                      , 'Murcia'),
  ('Málaga'                      , 'Málaga'),
  ('Navarra'                     , 'Pamplona/Iruña'),
  ('Ourense'                     , 'Ourense'),
  ('Palencia'                    , 'Palencia'),
  ('Pontevedra'                  , 'Vigo'),
  ('Salamanca'                   , 'Salamanca'),
  ('Santa Cruz de Tenerife'      , 'Santa Cruz de Tenerife'),
  ('Segovia'                     , 'Segovia'),
  ('Sevilla'                     , 'Sevilla'),
  ('Soria'                       , 'Soria'),
  ('Tarragona'                   , 'Tarragona'),
  ('Teruel'                      , 'Teruel'),
  ('Toledo'                      , 'Toledo'),
  ('Valencia'                    , 'Valencia'),
  ('Valladolid'                  , 'Valladolid'),
  ('Zamora'                      , 'Zamora'),
  ('Zaragoza'                    , 'Zaragoza'),
  ('Álava'                       , 'Vitoria-Gasteiz'),
  ('Ávila'                       , 'Ávila')
)
update public.perfiles p
   set resumen_estado = 'aprobado',
       foto_estado    = 'aprobada',        -- no hay foto que moderar
       provincia      = c.provincia,
       -- Los alquileres se cobran por día, no por hora (22_unidad_precio.sql)
       unidad_precio  = case when p.categoria like 'Alquiler de%'
                             then 'dia' else 'hora' end,
       -- La misma fecha que la cuenta, repartida hacia atrás, para que en
       -- el panel no aparezcan las 312 apiladas en el mismo minuto.
       creado_en      = u.created_at
  from auth.users u, provincias c
 where u.id = p.id
   and c.municipio = p.ciudad
   and u.email like '%@semilla.cleander.app';


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
-- Debe salir, en cada fila: 156 perfiles, 53 categorías y 52 provincias.


-- ═══════════════════════════════════════════════════════════════════════
--  BORRADO — cuando haya usuarios de verdad, esto los quita todos
-- ═══════════════════════════════════════════════════════════════════════
--
--  Borra también los 'like' que hayan recibido, sus matches y sus
--  valoraciones, porque todas las claves ajenas van con `on delete
--  cascade` (01_esquema.sql:15, 56, 74, 86).
--
--  No toca ni una sola cuenta real: el filtro es el dominio del correo.
--
-- delete from auth.users where email like '%@semilla.cleander.app';
