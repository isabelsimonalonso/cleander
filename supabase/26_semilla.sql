-- ═══════════════════════════════════════════════════════════════════════
--  26_semilla.sql — perfiles de muestra para el lanzamiento
-- ═══════════════════════════════════════════════════════════════════════
--
--  486 perfiles inventados: las 52 provincias, entre ocho y diez personas
--  en cada una, mitad y mitad de cada lado. Así ninguna búsqueda por
--  provincia devuelve el mazo vacío, filtre quien filtre y desde donde
--  filtre.
--
--  Están las 82 categorías, y ninguna provincia repite oficio. Cada
--  categoría sale unas seis veces en toda España, tres por cada lado.
--
--  Los resúmenes, y aquí hubo que rehacerlo: el primero de cada categoría
--  lleva un texto escrito para ese oficio, y el resto sale de una reserva
--  de textos generales. La primera versión tenía una reserva única para
--  todo, escrita pensando en oficios de reparación, y saltaban cosas como
--  «me han dicho que lo haga ya, antes de que vaya a peor» en una tarjeta
--  de Cuidado de niños.
--
--  Ahora la reserva es POR GRUPO: seis textos para cada grupo y cada rol.
--  El registro de un alquiler no es el de un cuidado ni el de una avería,
--  y se nota en cuanto los pones juntos.
--
--  LOS PRECIOS son de mercado, no inventados: salen de lo que se cobra de
--  verdad en España en 2026, consultado en Cronoshare, Servicehero y los
--  catálogos de alquiler de maquinaria. Un par de ejemplos: la hora de
--  limpieza doméstica va de 12 a 17 €, la de fontanería de 30 a 45, la de
--  canguro de 9 a 14 y una sesión de fisioterapia a domicilio de 40 a 60.
--
--  Dentro de cada oficio, quien OFRECE se mueve en la banda de mercado y
--  quien BUSCA presupuesta por debajo (un 10-15% menos), que es lo que
--  pasa en la vida real. Así las dos caras del mazo no se contradicen.
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


-- ── 2 · Los 486 perfiles ───────────────────────────────────────────────

with gente (n, rol, nombre, categoria, precio, municipio, resumen) as (values

  -- ── A Coruña ──
  (  1, 'servicio' , 'Fernando R.' , 'Limpieza'                                 ,  13, 'A Coruña'                                  , 'Limpieza de pisos y comunidades. Productos incluidos. Disponible mañanas de lunes a viernes.'),
  (  2, 'servicio' , 'Guillermo R.', 'Limpieza de cristales'                    ,  15, 'A Coruña'                                  , 'Cristales, escaparates y ventanas de altura. Trabajo con pértiga y agua osmotizada.'),
  (  3, 'servicio' , 'Rubén P.'    , 'Limpieza de fin de obra'                  ,  17, 'A Coruña'                                  , 'Dejo la vivienda lista para entrar a vivir después de la reforma. Retirada de restos incluida.'),
  (  4, 'cliente'  , 'Pilar P.'    , 'Alquiler de robot limpiacristales'        ,  17, 'A Coruña'                                  , 'Tengo mamparas y ventanas altas y quiero probar si el robot se apaña.'),
  (  5, 'cliente'  , 'Ainhoa P.'   , 'Alquiler de robot limpiafondos de piscina',  29, 'A Coruña'                                  , 'Abrimos la piscina en junio y solo lo necesito ese fin de semana.'),
  (  6, 'cliente'  , 'Sonia C.'    , 'Alquiler de robot cortacésped'            ,  29, 'A Coruña'                                  , 'Me voy tres semanas y quiero dejar el césped controlado mientras no estoy.'),

  -- ── Albacete ──
  (  7, 'servicio' , 'Aitor C.'    , 'Planchado y lavandería'                   ,  11, 'Albacete'                                  , 'Recojo la ropa, la plancho y la devuelvo en 48 horas. También colada completa.'),
  (  8, 'servicio' , 'Unai C.'     , 'Control de plagas'                        ,  39, 'Albacete'                                  , 'Cucarachas, chinches, termitas y avispas. Productos autorizados y certificado del tratamiento.'),
  (  9, 'servicio' , 'Emilio S.'   , 'Alquiler de robot aspirador'              ,  17, 'Albacete'                                  , 'Robot aspirador con base de vaciado. Lo llevo a casa y lo recojo. Mínimo dos días.'),
  ( 10, 'cliente'  , 'Arturo S.'   , 'Alquiler de aspirador industrial'         ,  24, 'Albacete'                                  , 'Vamos a vaciar el trastero y aquello lleva años sin abrirse.'),
  ( 11, 'cliente'  , 'Sergio L.'   , 'Alquiler de máquina de vapor'             ,  24, 'Albacete'                                  , 'Quiero desinfectar las juntas del baño sin usar lejía, que tengo críos.'),
  ( 12, 'cliente'  , 'Laura L.'    , 'Alquiler de hidrolimpiadora'              ,  29, 'Albacete'                                  , 'La terraza y la fachada del garaje están negras. Un fin de semana me basta.'),

  -- ── Alicante ──
  ( 13, 'servicio' , 'Emma L.'     , 'Alquiler de robot fregasuelos'            ,  17, 'Alicante/Alacant'                          , 'Fregasuelos automático para pisos grandes. Incluye recambios y detergente para toda la semana.'),
  ( 14, 'servicio' , 'Irene D.'    , 'Alquiler de robot limpiacristales'        ,  20, 'Alicante/Alacant'                          , 'Robot para ventanales y mamparas. Muy útil si tienes cristales a los que no llegas.'),
  ( 15, 'servicio' , 'Amparo D.'   , 'Alquiler de robot limpiafondos de piscina',  34, 'Alicante/Alacant'                          , 'Limpiafondos automático para piscinas de hasta diez metros. Alquiler por fines de semana.'),
  ( 16, 'cliente'  , 'Ernesto D.'  , 'Alquiler de abrillantadora de suelos'     ,  34, 'Alicante/Alacant'                          , 'Tengo terrazo antiguo y quiero ver cómo queda antes de plantearme cambiarlo.'),
  ( 17, 'cliente'  , 'Adrián V.'   , 'Alquiler de limpiamoquetas'               ,  29, 'Alicante/Alacant'                          , 'El sofá y las alfombras piden una limpieza a fondo. Un día suelto.'),
  ( 18, 'cliente'  , 'Susana V.'   , 'Alquiler de deshumidificador'             ,  17, 'Alicante/Alacant'                          , 'Tuvimos una fuga del vecino y la pared no termina de secarse.'),

  -- ── Almería ──
  ( 19, 'servicio' , 'Álvaro G.'   , 'Alquiler de robot cortacésped'            ,  34, 'Almería'                                   , 'Cortacésped robot con cable perimetral. Lo instalo yo el primer día y te explico el manejo.'),
  ( 20, 'servicio' , 'Inés G.'     , 'Alquiler de aspirador industrial'         ,  28, 'Almería'                                   , 'Aspirador de sólidos y líquidos. Para obras, trasteros o después de una inundación.'),
  ( 21, 'servicio' , 'Ignacio G.'  , 'Alquiler de máquina de vapor'             ,  28, 'Almería'                                   , 'Vapor a presión para juntas, baños y cocinas. Desinfecta sin productos químicos.'),
  ( 22, 'cliente'  , 'Carmen T.'   , 'Alquiler de generador eléctrico'          ,  39, 'Almería'                                   , 'Celebración familiar en una finca sin luz. Lo necesito solo un sábado.'),
  ( 23, 'cliente'  , 'Ramón T.'    , 'Alquiler de andamio o escalera'           ,  20, 'Almería'                                   , 'Tengo que pintar el hueco de la escalera y no llego ni de lejos.'),
  ( 24, 'cliente'  , 'Valeria T.'  , 'Alquiler de herramienta eléctrica'        ,  12, 'Almería'                                   , 'Necesito un martillo percutor un par de días para colgar unas baldas.'),

  -- ── Asturias ──
  ( 25, 'servicio' , 'Raúl N.'     , 'Alquiler de hidrolimpiadora'              ,  33, 'Gijón'                                     , 'Hidrolimpiadora de agua a presión para fachadas, terrazas y coches. Con mangueras y boquillas.'),
  ( 26, 'servicio' , 'Cecilia N.'  , 'Alquiler de abrillantadora de suelos'     ,  39, 'Gijón'                                     , 'Abrillantadora para terrazo y mármol. Incluye discos y cera. Explico el uso antes de dejarla.'),
  ( 27, 'servicio' , 'Rebeca N.'   , 'Alquiler de limpiamoquetas'               ,  33, 'Gijón'                                     , 'Máquina de inyección y extracción para moquetas, sofás y colchones. Con producto incluido.'),
  ( 28, 'cliente'  , 'Lucía A.'    , 'Fontanería'                               ,  29, 'Gijón'                                     , 'Gotea el grifo de la cocina y la cisterna del baño no para de correr.'),
  ( 29, 'cliente'  , 'Ana A.'      , 'Electricidad'                             ,  33, 'Gijón'                                     , 'Salta el automático cuando enciendo el horno y la vitro a la vez.'),
  ( 30, 'cliente'  , 'Paula B.'    , 'Calefacción y calderas'                   ,  33, 'Gijón'                                     , 'La caldera tiene doce años y quiero la revisión antes de que llegue el frío.'),

  -- ── Badajoz ──
  ( 31, 'servicio' , 'Daniel B.'   , 'Alquiler de deshumidificador'             ,  20, 'Badajoz'                                   , 'Deshumidificador de obra para humedades o después de una fuga. Alquiler por semanas.'),
  ( 32, 'servicio' , 'Carolina B.' , 'Alquiler de generador eléctrico'          ,  45, 'Badajoz'                                   , 'Generador de gasolina para obras, mudanzas o fiestas. Silencioso y con dos enchufes.'),
  ( 33, 'servicio' , 'Gonzalo Q.'  , 'Alquiler de andamio o escalera'           ,  24, 'Badajoz'                                   , 'Andamio de aluminio y escaleras de tijera de varias alturas. Montaje incluido si hace falta.'),
  ( 34, 'cliente'  , 'Bruno Q.'    , 'Aire acondicionado'                       ,  33, 'Badajoz'                                   , 'Quiero poner un split en el dormitorio antes del verano. Piso de 70 metros.'),
  ( 35, 'cliente'  , 'Jimena Q.'   , 'Cerrajería'                               ,  38, 'Badajoz'                                   , 'Me he quedado con media llave dentro del bombín de la puerta de casa.'),
  ( 36, 'cliente'  , 'Patricia F.' , 'Desatascos'                               ,  38, 'Badajoz'                                   , 'El fregadero traga muy despacio y ya he probado todo lo del supermercado.'),

  -- ── Barcelona ──
  ( 37, 'servicio' , 'Samuel F.'   , 'Alquiler de herramienta eléctrica'        ,  14, 'Barcelona'                                 , 'Taladros, radiales, lijadoras y martillo percutor. Por días sueltos o fin de semana.'),
  ( 38, 'servicio' , 'Rocío H.'    , 'Fontanería'                               ,  33, 'Barcelona'                                 , 'Fugas, grifería, cisternas y cambio de tuberías. Aviso urgente el mismo día si puedo.'),
  ( 39, 'servicio' , 'Antonio H.'  , 'Electricidad'                             ,  38, 'Barcelona'                                 , 'Cuadros eléctricos, enchufes, avería general y boletín. Instaladora autorizada.'),
  ( 40, 'cliente'  , 'Gloria H.'   , 'Reparación de electrodomésticos'          ,  29, 'Barcelona'                                 , 'La lavadora no centrifuga y tiene solo cuatro años. Quiero saber si merece arreglarla.'),
  ( 41, 'cliente'  , 'Tomás J.'    , 'Antenas y televisión'                     ,  29, 'Barcelona'                                 , 'Desde el temporal se ve fatal la mitad de los canales.'),
  ( 42, 'cliente'  , 'Víctor J.'   , 'Informática y redes'                      ,  24, 'Barcelona'                                 , 'El wifi no llega al fondo de la casa y trabajo desde esa habitación.'),

  -- ── Bizkaia ──
  ( 43, 'servicio' , 'Lidia J.'    , 'Calefacción y calderas'                   ,  38, 'Bilbao'                                    , 'Mantenimiento y reparación de calderas de gas. Revisión anual y puesta a punto antes del frío.'),
  ( 44, 'servicio' , 'Noelia E.'   , 'Aire acondicionado'                       ,  38, 'Bilbao'                                    , 'Instalación de split y conductos, limpieza de filtros y recarga de gas.'),
  ( 45, 'servicio' , 'Enrique E.'  , 'Cerrajería'                               ,  44, 'Bilbao'                                    , 'Aperturas sin romper, cambio de bombín y puertas acorazadas. También urgencias de noche.'),
  ( 46, 'cliente'  , 'Nuria Z.'    , 'Placas solares'                           ,  37, 'Bilbao'                                    , 'Quiero que alguien me diga con números si me compensa ponerlas en mi tejado.'),
  ( 47, 'cliente'  , 'Pablo Z.'    , 'Albañilería'                              ,  21, 'Bilbao'                                    , 'Se ha caído un trozo de alicatado del baño y quiero repararlo bien.'),
  ( 48, 'cliente'  , 'Alba Z.'     , 'Pintura'                                  ,  17, 'Bilbao'                                    , 'Piso de dos habitaciones, quitar gotelé y pintar en blanco. Está vacío.'),

  -- ── Burgos ──
  ( 49, 'servicio' , 'Andrés I.'   , 'Desatascos'                               ,  44, 'Burgos'                                    , 'Desatascos de fregadero, baño y bajantes con máquina. Inspección con cámara si hace falta.'),
  ( 50, 'servicio' , 'Natalia I.'  , 'Reparación de electrodomésticos'          ,  33, 'Burgos'                                    , 'Lavadoras, lavavajillas, hornos y frigoríficos de todas las marcas. Presupuesto antes de tocar nada.'),
  ( 51, 'servicio' , 'Martín I.'   , 'Antenas y televisión'                     ,  33, 'Burgos'                                    , 'Antenas colectivas e individuales, TDT y parabólicas. Resintonizado y cableado.'),
  ( 52, 'cliente'  , 'Alicia O.'   , 'Carpintería'                              ,  23, 'Burgos'                                    , 'Quiero un armario a medida en un hueco raro del pasillo.'),
  ( 53, 'cliente'  , 'Félix O.'    , 'Escayola y pladur'                        ,  21, 'Burgos'                                    , 'Quiero bajar el techo del salón y meter focos empotrados.'),
  ( 54, 'cliente'  , 'Mario O.'    , 'Suelos y parquet'                         ,  23, 'Burgos'                                    , 'El parquet está muy rayado. Dudo entre acuchillarlo o poner laminado encima.'),

  -- ── Cantabria ──
  ( 55, 'servicio' , 'Ángel U.'    , 'Informática y redes'                      ,  29, 'Santander'                                 , 'Ordenadores lentos, wifi que no llega, copias de seguridad y correo. Voy a domicilio.'),
  ( 56, 'servicio' , 'Lorenzo U.'  , 'Placas solares'                           ,  43, 'Santander'                                 , 'Estudio, instalación y legalización de autoconsumo. Te digo de verdad si te sale a cuenta.'),
  ( 57, 'servicio' , 'Óscar Y.'    , 'Albañilería'                              ,  24, 'Santander'                                 , 'Tabiques, alicatados, arreglos de fachada y pequeñas obras. Recojo los escombros.'),
  ( 58, 'cliente'  , 'Eva Y.'      , 'Ventanas y cristalería'                   ,  26, 'Santander'                                 , 'Las ventanas son de aluminio viejo y se oye la calle entera.'),
  ( 59, 'cliente'  , 'Lucas Y.'    , 'Persianas y toldos'                       ,  26, 'Santander'                                 , 'La persiana del salón se ha quedado a medias y no sube ni baja.'),
  ( 60, 'cliente'  , 'Vanesa X.'   , 'Reformas integrales'                      ,  29, 'Santander'                                 , 'Piso heredado de los años setenta. Hay que hacerlo entero, sin prisa pero con presupuesto.'),

  -- ── Castellón ──
  ( 61, 'servicio' , 'Yolanda X.'  , 'Pintura'                                  ,  20, 'Castellón de la Plana/Castelló de la Plana', 'Pintura de interiores, alisado de gotelé y esmalte de puertas. Protejo muebles y suelos.'),
  ( 62, 'servicio' , 'Iker X.'     , 'Carpintería'                              ,  27, 'Castellón de la Plana/Castelló de la Plana', 'Muebles a medida, armarios empotrados y arreglo de puertas que rozan.'),
  ( 63, 'servicio' , 'Jorge W.'    , 'Escayola y pladur'                        ,  24, 'Castellón de la Plana/Castelló de la Plana', 'Techos de pladur, focos empotrados y molduras. Trabajo limpio y en plazo.'),
  ( 64, 'cliente'  , 'Belén W.'    , 'Jardinería'                               ,  16, 'Castellón de la Plana/Castelló de la Plana', 'Jardín pequeño con seto y césped. Busco mantenimiento una vez al mes.'),
  ( 65, 'cliente'  , 'Iván K.'     , 'Piscinas'                                 ,  24, 'Castellón de la Plana/Castelló de la Plana', 'El agua se me pone verde cada verano y nunca doy con el punto.'),
  ( 66, 'cliente'  , 'Clara K.'    , 'Limpieza de tejados y canalones'          ,  24, 'Castellón de la Plana/Castelló de la Plana', 'Los canalones están llenos de hojas y en la última tormenta se desbordaron.'),

  -- ── Ceuta ──
  ( 67, 'servicio' , 'Salvador K.' , 'Suelos y parquet'                         ,  27, 'Ceuta'                                     , 'Instalación de laminado y vinílico, acuchillado y barnizado de parquet antiguo.'),
  ( 68, 'servicio' , 'Lorena M.'   , 'Ventanas y cristalería'                   ,  30, 'Ceuta'                                     , 'Ventanas de aluminio y PVC, doble acristalamiento y cambio de cristales rotos.'),
  ( 69, 'servicio' , 'Rosa M.'     , 'Persianas y toldos'                       ,  30, 'Ceuta'                                     , 'Persianas que no suben, cintas, motores y toldos de terraza. Reparación y cambio.'),
  ( 70, 'cliente'  , 'Soledad M.'  , 'Montaje de muebles'                       ,  24, 'Ceuta'                                     , 'Tengo tres cajas de un armario en el pasillo desde hace un mes.'),
  ( 71, 'cliente'  , 'Ismael R.'   , 'Mudanzas'                                 ,  29, 'Ceuta'                                     , 'Me mudo dentro del mismo pueblo. Piso de dos habitaciones, con ascensor en los dos.'),
  ( 72, 'cliente'  , 'Olga R.'     , 'Portes y transporte'                      ,  24, 'Ceuta'                                     , 'He comprado un sofá de segunda mano y no tengo cómo traerlo.'),

  -- ── Ciudad Real ──
  ( 73, 'servicio' , 'Julián P.'   , 'Reformas integrales'                      ,  33, 'Ciudad Real'                               , 'Reforma completa de cocinas y baños, con todos los gremios coordinados por mí.'),
  ( 74, 'servicio' , 'Sara P.'     , 'Jardinería'                               ,  18, 'Ciudad Real'                               , 'Siega, poda, setos y riego automático. Mantenimiento mensual o trabajo suelto.'),
  ( 75, 'servicio' , 'Héctor P.'   , 'Piscinas'                                 ,  28, 'Ciudad Real'                               , 'Puesta a punto de primavera, tratamiento del agua y reparación de depuradoras.'),
  ( 76, 'cliente'  , 'Silvia C.'   , 'Tapicería'                                ,  24, 'Ciudad Real'                               , 'Tengo dos sillones buenos de mi madre y quiero tapizarlos en vez de tirarlos.'),
  ( 77, 'cliente'  , 'Alberto C.'  , 'Vaciado de pisos'                         ,  24, 'Ciudad Real'                               , 'Hay que vaciar la casa de mis padres. Sin prisa y con cuidado con lo que hay dentro.'),
  ( 78, 'cliente'  , 'Borja C.'    , 'Cuidado de mayores'                       ,  11, 'Ciudad Real'                               , 'Busco acompañamiento para mi padre por las mañanas, tres días por semana.'),

  -- ── Cuenca ──
  ( 79, 'servicio' , 'Hugo S.'     , 'Limpieza de tejados y canalones'          ,  28, 'Cuenca'                                    , 'Canalones atascados, tejas rotas y musgo. Trabajo en altura con línea de vida.'),
  ( 80, 'servicio' , 'Marina S.'   , 'Montaje de muebles'                       ,  28, 'Cuenca'                                    , 'Monto armarios, cocinas y estanterías de cualquier tienda. Traigo mis herramientas.'),
  ( 81, 'servicio' , 'Candela S.'  , 'Mudanzas'                                 ,  33, 'Cuenca'                                    , 'Mudanzas de piso completo con furgón y dos personas. Embalaje si lo necesitas.'),
  ( 82, 'cliente'  , 'Miriam L.'   , 'Cuidado de niños'                         ,   9, 'Cuenca'                                    , 'Necesito que recojan a los niños del colegio dos tardes por semana.'),
  ( 83, 'cliente'  , 'Mónica L.'   , 'Cuidado de mascotas'                      ,   9, 'Cuenca'                                    , 'Dos paseos al día para mi perra las semanas que viajo por trabajo.'),
  ( 84, 'cliente'  , 'Elena D.'    , 'Reparaciones generales'                   ,  24, 'Cuenca'                                    , 'Tengo una lista de diez chapuzas pequeñas por toda la casa.'),

  -- ── Cáceres ──
  ( 85, 'servicio' , 'Manuel D.'   , 'Portes y transporte'                      ,  28, 'Cáceres'                                   , 'Portes pequeños, recogida de compras voluminosas y viajes al punto limpio.'),
  ( 86, 'servicio' , 'Nieves D.'   , 'Tapicería'                                ,  28, 'Cáceres'                                   , 'Tapizo sofás, sillas y cabeceros. Puedes elegir la tela o traerla tú.'),
  ( 87, 'servicio' , 'Marcos V.'   , 'Vaciado de pisos'                         ,  28, 'Cáceres'                                   , 'Vaciado completo de viviendas y trasteros, con separación de lo aprovechable.'),
  ( 88, 'cliente'  , 'Nicolás V.'  , 'Costura y arreglos de ropa'               ,  11, 'Cáceres'                                   , 'Unos pantalones para coger bajos y una cremallera de cazadora.'),
  ( 89, 'cliente'  , 'Noa V.'      , 'Cocina a domicilio'                       ,  24, 'Cáceres'                                   , 'Cena de cumpleaños en casa para doce personas. Prefiero no cocinar ese día.'),
  ( 90, 'cliente'  , 'Cristina G.' , 'Clases particulares'                      ,  11, 'Cáceres'                                   , 'Mi hija va floja en matemáticas de tercero de la ESO.'),

  -- ── Cádiz ──
  ( 91, 'servicio' , 'Mateo G.'    , 'Cuidado de mayores'                       ,  13, 'Jerez de la Frontera'                      , 'Acompañamiento, aseo y comidas. Experiencia con personas con movilidad reducida.'),
  ( 92, 'servicio' , 'Beatriz T.'  , 'Cuidado de niños'                         ,  10, 'Jerez de la Frontera'                      , 'Recogida del colegio, meriendas y deberes. Disponible por las tardes.'),
  ( 93, 'servicio' , 'Javier T.'   , 'Cuidado de mascotas'                      ,  11, 'Jerez de la Frontera'                      , 'Paseos diarios y visitas a domicilio cuando te vas de viaje. Perros y gatos.'),
  ( 94, 'cliente'  , 'Carla T.'    , 'Peluquería y estética a domicilio'        ,  20, 'Jerez de la Frontera'                      , 'Salgo poco de casa y me vendría bien que vinieran a cortarme el pelo.'),
  ( 95, 'cliente'  , 'Diego N.'    , 'Limpieza'                                 ,  11, 'Jerez de la Frontera'                      , 'Busco a alguien para el piso dos mañanas por semana. Somos tres en casa y un perro.'),
  ( 96, 'cliente'  , 'Celia N.'    , 'Limpieza de cristales'                    ,  13, 'Jerez de la Frontera'                      , 'Tengo un ventanal grande al que no llego y da a un patio interior.'),

  -- ── Córdoba ──
  ( 97, 'servicio' , 'Gabriel N.'  , 'Reparaciones generales'                   ,  28, 'Córdoba'                                   , 'Ese arreglo pequeño que llevas meses posponiendo: cuadros, silicona, bisagras, grifos.'),
  ( 98, 'servicio' , 'Teresa A.'   , 'Costura y arreglos de ropa'               ,  13, 'Córdoba'                                   , 'Bajos, cremalleras, ajustes de talla y arreglo de cortinas.'),
  ( 99, 'servicio' , 'Joaquín A.'  , 'Cocina a domicilio'                       ,  29, 'Córdoba'                                   , 'Cocino en tu casa para cenas y celebraciones, o dejo la semana preparada en tápers.'),
  (100, 'cliente'  , 'Marta B.'    , 'Limpieza de fin de obra'                  ,  15, 'Córdoba'                                   , 'Acabamos de reformar la cocina y aquello está lleno de polvo de yeso.'),
  (101, 'cliente'  , 'Fernando B.' , 'Planchado y lavandería'                   ,   9, 'Córdoba'                                   , 'Necesito que alguien se lleve la plancha de la semana. Camisas sobre todo.'),
  (102, 'cliente'  , 'Guillermo B.', 'Control de plagas'                        ,  34, 'Córdoba'                                   , 'Han salido cucarachas en el bajo del edificio y quiero tratarlo antes del verano.'),

  -- ── Gipuzkoa ──
  (103, 'servicio' , 'Rubén Q.'    , 'Clases particulares'                      ,  13, 'Donostia/San Sebastián'                    , 'Matemáticas y física de secundaria y bachillerato. A domicilio o en biblioteca.'),
  (104, 'servicio' , 'Pilar Q.'    , 'Peluquería y estética a domicilio'        ,  23, 'Donostia/San Sebastián'                    , 'Corte, color y manicura en tu casa. Muy cómodo si te cuesta salir.'),
  (105, 'servicio' , 'Ainhoa Q.'   , 'Limpieza'                                 ,  15, 'Donostia/San Sebastián'                    , 'Puedo ir un día suelto o venir fija cada semana. Lo que necesites.'),
  (106, 'cliente'  , 'Sonia F.'    , 'Alquiler de robot aspirador'              ,  15, 'Donostia/San Sebastián'                    , 'Quiero probar uno una semana antes de decidir si me compro el mío.'),
  (107, 'cliente'  , 'Aitor F.'    , 'Alquiler de robot fregasuelos'            ,  15, 'Donostia/San Sebastián'                    , 'Me he roto un pie y necesito apañarme unas semanas sin fregar a mano.'),
  (108, 'cliente'  , 'Unai F.'     , 'Alquiler de robot limpiacristales'        ,  21, 'Donostia/San Sebastián'                    , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Girona ──
  (109, 'servicio' , 'Emilio H.'   , 'Limpieza de cristales'                    ,  18, 'Girona'                                    , 'Me organizo sola, no hace falta que estés en casa mientras tanto.'),
  (110, 'servicio' , 'Arturo H.'   , 'Limpieza de fin de obra'                  ,  21, 'Girona'                                    , 'Tengo referencias de las casas donde llevo tiempo, por si las quieres.'),
  (111, 'servicio' , 'Sergio J.'   , 'Planchado y lavandería'                   ,  13, 'Girona'                                    , 'Puedo ir un día suelto o venir fija cada semana. Lo que necesites.'),
  (112, 'cliente'  , 'Laura J.'    , 'Alquiler de robot limpiafondos de piscina',  38, 'Girona'                                    , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (113, 'cliente'  , 'Emma J.'     , 'Alquiler de robot cortacésped'            ,  38, 'Girona'                                    , 'Quiero probarlo antes de decidir si me compro uno.'),
  (114, 'cliente'  , 'Irene E.'    , 'Alquiler de aspirador industrial'         ,  30, 'Girona'                                    , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Granada ──
  (115, 'servicio' , 'Amparo E.'   , 'Control de plagas'                        ,  47, 'Granada'                                   , 'Me organizo sola, no hace falta que estés en casa mientras tanto.'),
  (116, 'servicio' , 'Ernesto E.'  , 'Alquiler de robot aspirador'              ,  21, 'Granada'                                   , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (117, 'servicio' , 'Adrián Z.'   , 'Alquiler de robot fregasuelos'            ,  21, 'Granada'                                   , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (118, 'cliente'  , 'Susana Z.'   , 'Alquiler de máquina de vapor'             ,  30, 'Granada'                                   , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (119, 'cliente'  , 'Álvaro I.'   , 'Alquiler de hidrolimpiadora'              ,  35, 'Granada'                                   , 'Quiero probarlo antes de decidir si me compro uno.'),
  (120, 'cliente'  , 'Inés I.'     , 'Alquiler de abrillantadora de suelos'     ,  42, 'Granada'                                   , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Guadalajara ──
  (121, 'servicio' , 'Ignacio I.'  , 'Alquiler de robot limpiacristales'        ,  24, 'Guadalajara'                               , 'Tengo más de uno, así que casi siempre hay libre.'),
  (122, 'servicio' , 'Carmen O.'   , 'Alquiler de robot limpiafondos de piscina',  42, 'Guadalajara'                               , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (123, 'servicio' , 'Ramón O.'    , 'Alquiler de robot cortacésped'            ,  42, 'Guadalajara'                               , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (124, 'cliente'  , 'Valeria O.'  , 'Alquiler de limpiamoquetas'               ,  35, 'Guadalajara'                               , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (125, 'cliente'  , 'Raúl U.'     , 'Alquiler de deshumidificador'             ,  22, 'Guadalajara'                               , 'Quiero probarlo antes de decidir si me compro uno.'),
  (126, 'cliente'  , 'Cecilia U.'  , 'Alquiler de generador eléctrico'          ,  52, 'Guadalajara'                               , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Huelva ──
  (127, 'servicio' , 'Rebeca U.'   , 'Alquiler de aspirador industrial'         ,  34, 'Huelva'                                    , 'Tengo más de uno, así que casi siempre hay libre.'),
  (128, 'servicio' , 'Lucía Y.'    , 'Alquiler de máquina de vapor'             ,  34, 'Huelva'                                    , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (129, 'servicio' , 'Ana Y.'      , 'Alquiler de hidrolimpiadora'              ,  39, 'Huelva'                                    , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (130, 'cliente'  , 'Paula X.'    , 'Alquiler de andamio o escalera'           ,  29, 'Huelva'                                    , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (131, 'cliente'  , 'Daniel X.'   , 'Alquiler de herramienta eléctrica'        ,  17, 'Huelva'                                    , 'Quiero probarlo antes de decidir si me compro uno.'),
  (132, 'cliente'  , 'Carolina X.' , 'Fontanería'                               ,  35, 'Huelva'                                    , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Huesca ──
  (133, 'servicio' , 'Gonzalo W.'  , 'Alquiler de abrillantadora de suelos'     ,  47, 'Huesca'                                    , 'Tengo más de uno, así que casi siempre hay libre.'),
  (134, 'servicio' , 'Bruno W.'    , 'Alquiler de limpiamoquetas'               ,  39, 'Huesca'                                    , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (135, 'servicio' , 'Jimena W.'   , 'Alquiler de deshumidificador'             ,  25, 'Huesca'                                    , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (136, 'cliente'  , 'Patricia K.' , 'Electricidad'                             ,  39, 'Huesca'                                    , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (137, 'cliente'  , 'Samuel K.'   , 'Calefacción y calderas'                   ,  39, 'Huesca'                                    , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (138, 'cliente'  , 'Rocío M.'    , 'Aire acondicionado'                       ,  39, 'Huesca'                                    , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Illes Balears ──
  (139, 'servicio' , 'Antonio M.'  , 'Alquiler de generador eléctrico'          ,  59, 'Palma de Mallorca'                         , 'Tengo más de uno, así que casi siempre hay libre.'),
  (140, 'servicio' , 'Gloria M.'   , 'Alquiler de andamio o escalera'           ,  32, 'Palma de Mallorca'                         , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (141, 'servicio' , 'Tomás R.'    , 'Alquiler de herramienta eléctrica'        ,  20, 'Palma de Mallorca'                         , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (142, 'cliente'  , 'Víctor R.'   , 'Cerrajería'                               ,  46, 'Palma de Mallorca'                         , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (143, 'cliente'  , 'Lidia R.'    , 'Desatascos'                               ,  49, 'Palma de Mallorca'                         , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (144, 'cliente'  , 'Noelia P.'   , 'Reparación de electrodomésticos'          ,  35, 'Palma de Mallorca'                         , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Jaén ──
  (145, 'servicio' , 'Enrique P.'  , 'Fontanería'                               ,  39, 'Jaén'                                      , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (146, 'servicio' , 'Nuria C.'    , 'Electricidad'                             ,  44, 'Jaén'                                      , 'Presupuesto cerrado antes de tocar nada.'),
  (147, 'servicio' , 'Pablo C.'    , 'Calefacción y calderas'                   ,  44, 'Jaén'                                      , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (148, 'cliente'  , 'Alba C.'     , 'Antenas y televisión'                     ,  35, 'Jaén'                                      , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (149, 'cliente'  , 'Andrés S.'   , 'Informática y redes'                      ,  33, 'Jaén'                                      , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (150, 'cliente'  , 'Natalia S.'  , 'Placas solares'                           ,  44, 'Jaén'                                      , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── La Rioja ──
  (151, 'servicio' , 'Martín S.'   , 'Aire acondicionado'                       ,  44, 'Logroño'                                   , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (152, 'servicio' , 'Alicia L.'   , 'Cerrajería'                               ,  52, 'Logroño'                                   , 'Presupuesto cerrado antes de tocar nada.'),
  (153, 'servicio' , 'Félix L.'    , 'Desatascos'                               ,  56, 'Logroño'                                   , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (154, 'cliente'  , 'Mario L.'    , 'Albañilería'                              ,  27, 'Logroño'                                   , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (155, 'cliente'  , 'Ángel D.'    , 'Pintura'                                  ,  22, 'Logroño'                                   , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (156, 'cliente'  , 'Lorenzo D.'  , 'Carpintería'                              ,  28, 'Logroño'                                   , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── Las Palmas ──
  (157, 'servicio' , 'Óscar V.'    , 'Reparación de electrodomésticos'          ,  39, 'Las Palmas de Gran Canaria'                , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (158, 'servicio' , 'Eva V.'      , 'Antenas y televisión'                     ,  39, 'Las Palmas de Gran Canaria'                , 'Presupuesto cerrado antes de tocar nada.'),
  (159, 'servicio' , 'Lucas V.'    , 'Informática y redes'                      ,  37, 'Las Palmas de Gran Canaria'                , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (160, 'cliente'  , 'Vanesa G.'   , 'Escayola y pladur'                        ,  25, 'Las Palmas de Gran Canaria'                , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (161, 'cliente'  , 'Yolanda G.'  , 'Suelos y parquet'                         ,  28, 'Las Palmas de Gran Canaria'                , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (162, 'cliente'  , 'Iker G.'     , 'Ventanas y cristalería'                   ,  31, 'Las Palmas de Gran Canaria'                , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── León ──
  (163, 'servicio' , 'Jorge T.'    , 'Placas solares'                           ,  49, 'León'                                      , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (164, 'servicio' , 'Belén T.'    , 'Albañilería'                              ,  30, 'León'                                      , 'Si hace falta, coordino yo a los demás gremios.'),
  (165, 'servicio' , 'Iván N.'     , 'Pintura'                                  ,  25, 'León'                                      , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (166, 'cliente'  , 'Clara N.'    , 'Persianas y toldos'                       ,  31, 'León'                                      , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (167, 'cliente'  , 'Salvador N.' , 'Reformas integrales'                      ,  35, 'León'                                      , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (168, 'cliente'  , 'Lorena A.'   , 'Jardinería'                               ,  22, 'León'                                      , 'Es una parcela pequeña, con sitio de sobra para trabajar.'),

  -- ── Lleida ──
  (169, 'servicio' , 'Rosa A.'     , 'Carpintería'                              ,  31, 'Lleida'                                    , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (170, 'servicio' , 'Soledad A.'  , 'Escayola y pladur'                        ,  28, 'Lleida'                                    , 'Si hace falta, coordino yo a los demás gremios.'),
  (171, 'servicio' , 'Ismael B.'   , 'Suelos y parquet'                         ,  31, 'Lleida'                                    , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (172, 'cliente'  , 'Olga B.'     , 'Piscinas'                                 ,  30, 'Lleida'                                    , 'Lo tengo abandonado desde hace un par de temporadas.'),
  (173, 'cliente'  , 'Julián Q.'   , 'Limpieza de tejados y canalones'          ,  30, 'Lleida'                                    , 'Busco a alguien que lo lleve cada cierto tiempo, no una cosa suelta.'),
  (174, 'cliente'  , 'Sara Q.'     , 'Montaje de muebles'                       ,  30, 'Lleida'                                    , 'Es poca cosa, pero yo solo no puedo con ello.'),

  -- ── Lugo ──
  (175, 'servicio' , 'Héctor Q.'   , 'Ventanas y cristalería'                   ,  35, 'Lugo'                                      , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (176, 'servicio' , 'Silvia F.'   , 'Persianas y toldos'                       ,  35, 'Lugo'                                      , 'Si hace falta, coordino yo a los demás gremios.'),
  (177, 'servicio' , 'Alberto F.'  , 'Reformas integrales'                      ,  39, 'Lugo'                                      , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (178, 'cliente'  , 'Borja F.'    , 'Mudanzas'                                 ,  35, 'Lugo'                                      , 'Me viene bien cualquier día, fin de semana incluido.'),
  (179, 'cliente'  , 'Hugo H.'     , 'Portes y transporte'                      ,  30, 'Lugo'                                      , 'Hay que subir a un tercero sin ascensor, lo aviso por delante.'),
  (180, 'cliente'  , 'Marina H.'   , 'Tapicería'                                ,  30, 'Lugo'                                      , 'Es poca cosa, pero yo solo no puedo con ello.'),

  -- ── Madrid ──
  (181, 'servicio' , 'Candela H.'  , 'Jardinería'                               ,  24, 'Madrid'                                    , 'Tengo seguro de responsabilidad civil al día.'),
  (182, 'servicio' , 'Miriam J.'   , 'Piscinas'                                 ,  34, 'Madrid'                                    , 'Mejor hacerlo antes de que llegue el mal tiempo, se nota mucho.'),
  (183, 'servicio' , 'Mónica J.'   , 'Limpieza de tejados y canalones'          ,  34, 'Madrid'                                    , 'Paso a verlo sin coste y te digo qué haría y lo que cuesta.'),
  (184, 'cliente'  , 'Elena E.'    , 'Vaciado de pisos'                         ,  30, 'Madrid'                                    , 'Me viene bien cualquier día, fin de semana incluido.'),
  (185, 'cliente'  , 'Manuel E.'   , 'Cuidado de mayores'                       ,  14, 'Madrid'                                    , 'Serían unas horas fijas entre semana, siempre las mismas.'),
  (186, 'cliente'  , 'Nieves E.'   , 'Cuidado de niños'                         ,  11, 'Madrid'                                    , 'Busco a alguien de confianza y con paciencia, es lo que más valoro.'),

  -- ── Melilla ──
  (187, 'servicio' , 'Marcos Z.'   , 'Montaje de muebles'                       ,  34, 'Melilla'                                   , 'Si hay que subir sin ascensor lo hablamos, pero se hace.'),
  (188, 'servicio' , 'Nicolás Z.'  , 'Mudanzas'                                 ,  39, 'Melilla'                                   , 'Te doy precio cerrado si me dices los metros y la planta.'),
  (189, 'servicio' , 'Noa Z.'      , 'Portes y transporte'                      ,  34, 'Melilla'                                   , 'Puedo un sábado o un domingo, sin recargo.'),
  (190, 'cliente'  , 'Cristina I.' , 'Cuidado de mascotas'                      ,  13, 'Melilla'                                   , 'Me gustaría que nos conociéramos antes de empezar.'),
  (191, 'cliente'  , 'Mateo I.'    , 'Reparaciones generales'                   ,  30, 'Melilla'                                   , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (192, 'cliente'  , 'Beatriz O.'  , 'Costura y arreglos de ropa'               ,  15, 'Melilla'                                   , 'Cuéntame si es algo que haces y cuánto me costaría.'),

  -- ── Murcia ──
  (193, 'servicio' , 'Javier O.'   , 'Tapicería'                                ,  34, 'Murcia'                                    , 'Si hay que subir sin ascensor lo hablamos, pero se hace.'),
  (194, 'servicio' , 'Carla O.'    , 'Vaciado de pisos'                         ,  34, 'Murcia'                                    , 'Te doy precio cerrado si me dices los metros y la planta.'),
  (195, 'servicio' , 'Diego U.'    , 'Cuidado de mayores'                       ,  16, 'Murcia'                                    , 'Puedo acompañar a citas médicas o a donde haga falta.'),
  (196, 'cliente'  , 'Celia U.'    , 'Cocina a domicilio'                       ,  33, 'Murcia'                                    , 'No tengo prisa, puedo esperar a que tengas hueco.'),
  (197, 'cliente'  , 'Gabriel U.'  , 'Clases particulares'                      ,  15, 'Murcia'                                    , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (198, 'cliente'  , 'Teresa Y.'   , 'Peluquería y estética a domicilio'        ,  26, 'Murcia'                                    , 'Cuéntame si es algo que haces y cuánto me costaría.'),

  -- ── Málaga ──
  (199, 'servicio' , 'Joaquín Y.'  , 'Cuidado de niños'                         ,  12, 'Málaga'                                    , 'Prefiero que nos conozcamos antes con una visita, sin compromiso.'),
  (200, 'servicio' , 'Marta X.'    , 'Cuidado de mascotas'                      ,  15, 'Málaga'                                    , 'Tengo formación en primeros auxilios.'),
  (201, 'servicio' , 'Fernando X.' , 'Reparaciones generales'                   ,  34, 'Málaga'                                    , 'Precio cerrado antes de empezar, sin sorpresas al final.'),
  (202, 'cliente'  , 'Guillermo X.', 'Limpieza'                                 ,  13, 'Málaga'                                    , 'Prefiero que venga siempre la misma persona y no una distinta cada vez.'),
  (203, 'cliente'  , 'Rubén W.'    , 'Limpieza de cristales'                    ,  16, 'Málaga'                                    , 'Busco a alguien de confianza, porque no siempre voy a estar en casa.'),
  (204, 'cliente'  , 'Pilar W.'    , 'Limpieza de fin de obra'                  ,  19, 'Málaga'                                    , 'Es un piso normal, nada del otro mundo. Quiero dejarlo a punto.'),

  -- ── Navarra ──
  (205, 'servicio' , 'Ainhoa W.'   , 'Costura y arreglos de ropa'               ,  17, 'Pamplona/Iruña'                            , 'Si es poca cosa lo digo y cobro poco. No me invento faena.'),
  (206, 'servicio' , 'Sonia K.'    , 'Cocina a domicilio'                       ,  37, 'Pamplona/Iruña'                            , 'Tengo hueco esta semana, también por las tardes.'),
  (207, 'servicio' , 'Aitor K.'    , 'Clases particulares'                      ,  17, 'Pamplona/Iruña'                            , 'Precio cerrado antes de empezar, sin sorpresas al final.'),
  (208, 'cliente'  , 'Unai K.'     , 'Planchado y lavandería'                   ,  12, 'Pamplona/Iruña'                            , 'Prefiero que venga siempre la misma persona y no una distinta cada vez.'),
  (209, 'cliente'  , 'Emilio M.'   , 'Control de plagas'                        ,  42, 'Pamplona/Iruña'                            , 'Busco a alguien de confianza, porque no siempre voy a estar en casa.'),
  (210, 'cliente'  , 'Arturo M.'   , 'Alquiler de robot aspirador'              ,  19, 'Pamplona/Iruña'                            , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Ourense ──
  (211, 'servicio' , 'Sergio R.'   , 'Peluquería y estética a domicilio'        ,  29, 'Ourense'                                   , 'Si es poca cosa lo digo y cobro poco. No me invento faena.'),
  (212, 'servicio' , 'Laura R.'    , 'Limpieza'                                 ,  16, 'Ourense'                                   , 'Tengo referencias de las casas donde llevo tiempo, por si las quieres.'),
  (213, 'servicio' , 'Emma R.'     , 'Limpieza de cristales'                    ,  19, 'Ourense'                                   , 'Puedo ir un día suelto o venir fija cada semana. Lo que necesites.'),
  (214, 'cliente'  , 'Irene P.'    , 'Alquiler de robot fregasuelos'            ,  19, 'Ourense'                                   , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (215, 'cliente'  , 'Amparo P.'   , 'Alquiler de robot limpiacristales'        ,  24, 'Ourense'                                   , 'Quiero probarlo antes de decidir si me compro uno.'),
  (216, 'cliente'  , 'Ernesto P.'  , 'Alquiler de robot limpiafondos de piscina',  43, 'Ourense'                                   , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Palencia ──
  (217, 'servicio' , 'Adrián C.'   , 'Limpieza de fin de obra'                  ,  23, 'Palencia'                                  , 'Me organizo sola, no hace falta que estés en casa mientras tanto.'),
  (218, 'servicio' , 'Susana C.'   , 'Planchado y lavandería'                   ,  14, 'Palencia'                                  , 'Tengo referencias de las casas donde llevo tiempo, por si las quieres.'),
  (219, 'servicio' , 'Álvaro S.'   , 'Control de plagas'                        ,  53, 'Palencia'                                  , 'Puedo ir un día suelto o venir fija cada semana. Lo que necesites.'),
  (220, 'cliente'  , 'Inés S.'     , 'Alquiler de robot cortacésped'            ,  43, 'Palencia'                                  , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (221, 'cliente'  , 'Ignacio S.'  , 'Alquiler de aspirador industrial'         ,  34, 'Palencia'                                  , 'Quiero probarlo antes de decidir si me compro uno.'),
  (222, 'cliente'  , 'Carmen L.'   , 'Alquiler de máquina de vapor'             ,  34, 'Palencia'                                  , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Pontevedra ──
  (223, 'servicio' , 'Ramón L.'    , 'Alquiler de robot aspirador'              ,  24, 'Vigo'                                      , 'Tengo más de uno, así que casi siempre hay libre.'),
  (224, 'servicio' , 'Valeria L.'  , 'Alquiler de robot fregasuelos'            ,  24, 'Vigo'                                      , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (225, 'servicio' , 'Raúl D.'     , 'Alquiler de robot limpiacristales'        ,  27, 'Vigo'                                      , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (226, 'cliente'  , 'Cecilia D.'  , 'Alquiler de hidrolimpiadora'              ,  38, 'Vigo'                                      , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (227, 'cliente'  , 'Rebeca D.'   , 'Alquiler de abrillantadora de suelos'     ,  48, 'Vigo'                                      , 'Quiero probarlo antes de decidir si me compro uno.'),
  (228, 'cliente'  , 'Lucía V.'    , 'Alquiler de limpiamoquetas'               ,  38, 'Vigo'                                      , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Salamanca ──
  (229, 'servicio' , 'Ana V.'      , 'Alquiler de robot limpiafondos de piscina',  48, 'Salamanca'                                 , 'Tengo más de uno, así que casi siempre hay libre.'),
  (230, 'servicio' , 'Paula G.'    , 'Alquiler de robot cortacésped'            ,  48, 'Salamanca'                                 , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (231, 'servicio' , 'Daniel G.'   , 'Alquiler de aspirador industrial'         ,  38, 'Salamanca'                                 , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (232, 'cliente'  , 'Carolina G.' , 'Alquiler de deshumidificador'             ,  26, 'Salamanca'                                 , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (233, 'cliente'  , 'Gonzalo T.'  , 'Alquiler de generador eléctrico'          ,  60, 'Salamanca'                                 , 'Quiero probarlo antes de decidir si me compro uno.'),
  (234, 'cliente'  , 'Bruno T.'    , 'Alquiler de andamio o escalera'           ,  34, 'Salamanca'                                 , 'Lo necesito unos días sueltos. Comprarlo no me compensa.'),

  -- ── Santa Cruz de Tenerife ──
  (235, 'servicio' , 'Jimena T.'   , 'Alquiler de máquina de vapor'             ,  38, 'Santa Cruz de Tenerife'                    , 'Tengo más de uno, así que casi siempre hay libre.'),
  (236, 'servicio' , 'Patricia N.' , 'Alquiler de hidrolimpiadora'              ,  43, 'Santa Cruz de Tenerife'                    , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (237, 'servicio' , 'Samuel N.'   , 'Alquiler de abrillantadora de suelos'     ,  53, 'Santa Cruz de Tenerife'                    , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (238, 'cliente'  , 'Rocío A.'    , 'Alquiler de herramienta eléctrica'        ,  21, 'Santa Cruz de Tenerife'                    , 'Con un fin de semana me vale. Puedo ir a recogerlo yo.'),
  (239, 'cliente'  , 'Antonio A.'  , 'Fontanería'                               ,  38, 'Santa Cruz de Tenerife'                    , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (240, 'cliente'  , 'Gloria A.'   , 'Electricidad'                             ,  43, 'Santa Cruz de Tenerife'                    , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Segovia ──
  (241, 'servicio' , 'Tomás B.'    , 'Alquiler de limpiamoquetas'               ,  43, 'Segovia'                                   , 'Tengo más de uno, así que casi siempre hay libre.'),
  (242, 'servicio' , 'Víctor B.'   , 'Alquiler de deshumidificador'             ,  29, 'Segovia'                                   , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (243, 'servicio' , 'Lidia B.'    , 'Alquiler de generador eléctrico'          ,  66, 'Segovia'                                   , 'Pido una fianza pequeña y la devuelvo entera al recogerlo.'),
  (244, 'cliente'  , 'Noelia Q.'   , 'Calefacción y calderas'                   ,  43, 'Segovia'                                   , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (245, 'cliente'  , 'Enrique Q.'  , 'Aire acondicionado'                       ,  43, 'Segovia'                                   , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (246, 'cliente'  , 'Nuria F.'    , 'Cerrajería'                               ,  52, 'Segovia'                                   , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Sevilla ──
  (247, 'servicio' , 'Pablo F.'    , 'Alquiler de andamio o escalera'           ,  38, 'Sevilla'                                   , 'Tengo más de uno, así que casi siempre hay libre.'),
  (248, 'servicio' , 'Alba F.'     , 'Alquiler de herramienta eléctrica'        ,  23, 'Sevilla'                                   , 'Si se estropea sin que sea culpa tuya, lo cambio y no lo cobro.'),
  (249, 'servicio' , 'Andrés H.'   , 'Fontanería'                               ,  43, 'Sevilla'                                   , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (250, 'cliente'  , 'Natalia H.'  , 'Desatascos'                               ,  55, 'Sevilla'                                   , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (251, 'cliente'  , 'Martín H.'   , 'Reparación de electrodomésticos'          ,  38, 'Sevilla'                                   , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (252, 'cliente'  , 'Alicia J.'   , 'Antenas y televisión'                     ,  38, 'Sevilla'                                   , 'Me han dicho que lo mire alguien antes de que vaya a más.'),

  -- ── Soria ──
  (253, 'servicio' , 'Félix J.'    , 'Electricidad'                             ,  48, 'Soria'                                     , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (254, 'servicio' , 'Mario J.'    , 'Calefacción y calderas'                   ,  48, 'Soria'                                     , 'Presupuesto cerrado antes de tocar nada.'),
  (255, 'servicio' , 'Ángel E.'    , 'Aire acondicionado'                       ,  48, 'Soria'                                     , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (256, 'cliente'  , 'Lorenzo E.'  , 'Informática y redes'                      ,  38, 'Soria'                                     , 'Necesito saber primero si tiene arreglo o hay que cambiarlo.'),
  (257, 'cliente'  , 'Óscar Z.'    , 'Placas solares'                           ,  48, 'Soria'                                     , 'Lleva un tiempo dando guerra y ya no sé por dónde cogerlo.'),
  (258, 'cliente'  , 'Eva Z.'      , 'Albañilería'                              ,  30, 'Soria'                                     , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── Tarragona ──
  (259, 'servicio' , 'Lucas Z.'    , 'Cerrajería'                               ,  58, 'Tarragona'                                 , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (260, 'servicio' , 'Vanesa I.'   , 'Desatascos'                               ,  62, 'Tarragona'                                 , 'Presupuesto cerrado antes de tocar nada.'),
  (261, 'servicio' , 'Yolanda I.'  , 'Reparación de electrodomésticos'          ,  43, 'Tarragona'                                 , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (262, 'cliente'  , 'Iker I.'     , 'Pintura'                                  ,  26, 'Tarragona'                                 , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (263, 'cliente'  , 'Jorge O.'    , 'Carpintería'                              ,  31, 'Tarragona'                                 , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (264, 'cliente'  , 'Belén O.'    , 'Escayola y pladur'                        ,  28, 'Tarragona'                                 , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── Teruel ──
  (265, 'servicio' , 'Iván U.'     , 'Antenas y televisión'                     ,  43, 'Teruel'                                    , 'Contesto rápido por WhatsApp. Mándame una foto y te oriento.'),
  (266, 'servicio' , 'Clara U.'    , 'Informática y redes'                      ,  43, 'Teruel'                                    , 'Presupuesto cerrado antes de tocar nada.'),
  (267, 'servicio' , 'Salvador U.' , 'Placas solares'                           ,  53, 'Teruel'                                    , 'Te digo si merece la pena arreglarlo o cambiarlo, aunque gane menos.'),
  (268, 'cliente'  , 'Lorena Y.'   , 'Suelos y parquet'                         ,  31, 'Teruel'                                    , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (269, 'cliente'  , 'Rosa Y.'     , 'Ventanas y cristalería'                   ,  35, 'Teruel'                                    , 'Quiero presupuesto por escrito y saber cuánto va a durar.'),
  (270, 'cliente'  , 'Soledad Y.'  , 'Persianas y toldos'                       ,  35, 'Teruel'                                    , 'No tengo prisa. Prefiero que quede bien hecho.'),

  -- ── Toledo ──
  (271, 'servicio' , 'Ismael X.'   , 'Albañilería'                              ,  33, 'Toledo'                                    , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (272, 'servicio' , 'Olga X.'     , 'Pintura'                                  ,  29, 'Toledo'                                    , 'Si hace falta, coordino yo a los demás gremios.'),
  (273, 'servicio' , 'Julián W.'   , 'Carpintería'                              ,  34, 'Toledo'                                    , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (274, 'cliente'  , 'Sara W.'     , 'Reformas integrales'                      ,  38, 'Toledo'                                    , 'La casa está vacía, así que se puede trabajar con libertad.'),
  (275, 'cliente'  , 'Héctor W.'   , 'Jardinería'                               ,  25, 'Toledo'                                    , 'Busco a alguien que lo lleve cada cierto tiempo, no una cosa suelta.'),
  (276, 'cliente'  , 'Silvia K.'   , 'Piscinas'                                 ,  34, 'Toledo'                                    , 'Es una parcela pequeña, con sitio de sobra para trabajar.'),

  -- ── Valencia ──
  (277, 'servicio' , 'Alberto K.'  , 'Escayola y pladur'                        ,  31, 'Valencia'                                  , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (278, 'servicio' , 'Borja K.'    , 'Suelos y parquet'                         ,  34, 'Valencia'                                  , 'Si hace falta, coordino yo a los demás gremios.'),
  (279, 'servicio' , 'Hugo M.'     , 'Ventanas y cristalería'                   ,  39, 'Valencia'                                  , 'Me manejo bien con casas antiguas, que es donde salen las sorpresas.'),
  (280, 'cliente'  , 'Marina M.'   , 'Limpieza de tejados y canalones'          ,  34, 'Valencia'                                  , 'Lo tengo abandonado desde hace un par de temporadas.'),
  (281, 'cliente'  , 'Candela M.'  , 'Montaje de muebles'                       ,  34, 'Valencia'                                  , 'Hay que subir a un tercero sin ascensor, lo aviso por delante.'),
  (282, 'cliente'  , 'Miriam R.'   , 'Mudanzas'                                 ,  38, 'Valencia'                                  , 'Es poca cosa, pero yo solo no puedo con ello.'),

  -- ── Valladolid ──
  (283, 'servicio' , 'Mónica R.'   , 'Persianas y toldos'                       ,  39, 'Valladolid'                                , 'Te enseño fotos de trabajos anteriores si quieres verlos.'),
  (284, 'servicio' , 'Elena P.'    , 'Reformas integrales'                      ,  43, 'Valladolid'                                , 'Si hace falta, coordino yo a los demás gremios.'),
  (285, 'servicio' , 'Manuel P.'   , 'Jardinería'                               ,  28, 'Valladolid'                                , 'Paso a verlo sin coste y te digo qué haría y lo que cuesta.'),
  (286, 'cliente'  , 'Nieves P.'   , 'Portes y transporte'                      ,  34, 'Valladolid'                                , 'Me viene bien cualquier día, fin de semana incluido.'),
  (287, 'cliente'  , 'Marcos C.'   , 'Tapicería'                                ,  34, 'Valladolid'                                , 'Hay que subir a un tercero sin ascensor, lo aviso por delante.'),
  (288, 'cliente'  , 'Nicolás C.'  , 'Vaciado de pisos'                         ,  34, 'Valladolid'                                , 'Es poca cosa, pero yo solo no puedo con ello.'),

  -- ── Zamora ──
  (289, 'servicio' , 'Noa C.'      , 'Piscinas'                                 ,  38, 'Zamora'                                    , 'Tengo seguro de responsabilidad civil al día.'),
  (290, 'servicio' , 'Cristina S.' , 'Limpieza de tejados y canalones'          ,  38, 'Zamora'                                    , 'Mejor hacerlo antes de que llegue el mal tiempo, se nota mucho.'),
  (291, 'servicio' , 'Mateo S.'    , 'Montaje de muebles'                       ,  38, 'Zamora'                                    , 'Puedo un sábado o un domingo, sin recargo.'),
  (292, 'cliente'  , 'Beatriz L.'  , 'Cuidado de mayores'                       ,  15, 'Zamora'                                    , 'Me gustaría que nos conociéramos antes de empezar.'),
  (293, 'cliente'  , 'Javier L.'   , 'Cuidado de niños'                         ,  12, 'Zamora'                                    , 'Serían unas horas fijas entre semana, siempre las mismas.'),
  (294, 'cliente'  , 'Carla L.'    , 'Cuidado de mascotas'                      ,  15, 'Zamora'                                    , 'Busco a alguien de confianza y con paciencia, es lo que más valoro.'),

  -- ── Zaragoza ──
  (295, 'servicio' , 'Diego D.'    , 'Mudanzas'                                 ,  43, 'Zaragoza'                                  , 'Si hay que subir sin ascensor lo hablamos, pero se hace.'),
  (296, 'servicio' , 'Celia D.'    , 'Portes y transporte'                      ,  38, 'Zaragoza'                                  , 'Te doy precio cerrado si me dices los metros y la planta.'),
  (297, 'servicio' , 'Gabriel D.'  , 'Tapicería'                                ,  38, 'Zaragoza'                                  , 'Puedo un sábado o un domingo, sin recargo.'),
  (298, 'cliente'  , 'Teresa V.'   , 'Reparaciones generales'                   ,  34, 'Zaragoza'                                  , 'No tengo prisa, puedo esperar a que tengas hueco.'),
  (299, 'cliente'  , 'Joaquín V.'  , 'Costura y arreglos de ropa'               ,  17, 'Zaragoza'                                  , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (300, 'cliente'  , 'Marta G.'    , 'Cocina a domicilio'                       ,  38, 'Zaragoza'                                  , 'Cuéntame si es algo que haces y cuánto me costaría.'),

  -- ── Álava ──
  (301, 'servicio' , 'Fernando G.' , 'Vaciado de pisos'                         ,  38, 'Vitoria-Gasteiz'                           , 'Si hay que subir sin ascensor lo hablamos, pero se hace.'),
  (302, 'servicio' , 'Guillermo G.', 'Cuidado de mayores'                       ,  17, 'Vitoria-Gasteiz'                           , 'Tengo formación en primeros auxilios.'),
  (303, 'servicio' , 'Rubén T.'    , 'Cuidado de niños'                         ,  13, 'Vitoria-Gasteiz'                           , 'Puedo acompañar a citas médicas o a donde haga falta.'),
  (304, 'cliente'  , 'Pilar T.'    , 'Clases particulares'                      ,  17, 'Vitoria-Gasteiz'                           , 'No tengo prisa, puedo esperar a que tengas hueco.'),
  (305, 'cliente'  , 'Ainhoa T.'   , 'Peluquería y estética a domicilio'        ,  30, 'Vitoria-Gasteiz'                           , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (306, 'cliente'  , 'Sonia N.'    , 'Limpieza'                                 ,  14, 'Vitoria-Gasteiz'                           , 'Es un piso normal, nada del otro mundo. Quiero dejarlo a punto.'),

  -- ── Ávila ──
  (307, 'servicio' , 'Aitor N.'    , 'Cuidado de mascotas'                      ,  17, 'Ávila'                                     , 'Prefiero que nos conozcamos antes con una visita, sin compromiso.'),
  (308, 'servicio' , 'Unai N.'     , 'Reparaciones generales'                   ,  38, 'Ávila'                                     , 'Tengo hueco esta semana, también por las tardes.'),
  (309, 'servicio' , 'Emilio A.'   , 'Costura y arreglos de ropa'               ,  19, 'Ávila'                                     , 'Precio cerrado antes de empezar, sin sorpresas al final.'),
  (310, 'cliente'  , 'Arturo A.'   , 'Limpieza de cristales'                    ,  17, 'Ávila'                                     , 'Prefiero que venga siempre la misma persona y no una distinta cada vez.'),
  (311, 'cliente'  , 'Sergio B.'   , 'Limpieza de fin de obra'                  ,  21, 'Ávila'                                     , 'Busco a alguien de confianza, porque no siempre voy a estar en casa.'),
  (312, 'cliente'  , 'Laura B.'    , 'Planchado y lavandería'                   ,  13, 'Ávila'                                     , 'Es un piso normal, nada del otro mundo. Quiero dejarlo a punto.'),

  -- ═══════════════════════════════════════════════════════════════════
  --  Los oficios que llegaron después: coches, mascotas, tecnología,
  --  belleza y salud. Otra vuelta por España, con el mismo criterio.
  -- ═══════════════════════════════════════════════════════════════════

  -- ── A Coruña ──
  (313, 'servicio' , 'Adriana R.'  , 'Lavado de coche a domicilio'              ,   24, 'A Coruña'                                  , 'Lavo el coche donde lo tengas aparcado, con agua y equipo propios. Exterior, llantas y aspirado por dentro.'),
  (314, 'servicio' , 'Álvaro P.'   , 'Fisioterapia a domicilio'                 ,   44, 'A Coruña'                                  , 'Fisioterapeuta colegiada. Voy con camilla a tu casa: lumbares, cervicales y recuperación después de una operación.'),
  (315, 'cliente'  , 'Amparo C.'   , 'Clases de informática e internet'         ,   15, 'A Coruña'                                  , 'Mi madre quiere aprender a hacer videollamadas y a mí me pierde la paciencia.'),
  (316, 'cliente'  , 'Andrea L.'   , 'Baño y aseo de mascotas'                  ,   20, 'A Coruña'                                  , 'Es un perro grande y en el piso no hay manera de bañarlo.'),

  -- ── Albacete ──
  (317, 'servicio' , 'Aroa S.'     , 'Limpieza de tapicería y interiores'       ,   34, 'Albacete'                                  , 'Tapicería, alfombrillas y techo con máquina de inyección. Quito manchas, pelo de mascota y olores.'),
  (318, 'servicio' , 'Asier G.'    , 'Masaje y relajación'                      ,   44, 'Albacete'                                  , 'Masaje descontracturante y relajante en tu casa, con camilla y toallas propias. Sesiones de una hora.'),
  (319, 'cliente'  , 'Bárbara T.'  , 'Ayuda con trámites online'                ,   15, 'Albacete'                                  , 'Necesito el certificado digital y pedir una cita, y no me aclaro con la página.'),
  (320, 'cliente'  , 'Benito N.'   , 'Paseo de perros'                          ,    8, 'Albacete'                                  , 'Necesito que alguien lo saque a mediodía entre semana, que yo no llego.'),

  -- ── Alicante ──
  (321, 'servicio' , 'Blanca A.'   , 'Pulido y tratamiento de pintura'          ,   40, 'Alicante/Alacant'                          , 'Pulido de arañazos leves y tratamiento de la pintura. Dejo el coche con brillo y protegido unos meses.'),
  (322, 'servicio' , 'Carmen V.'   , 'Entrenador personal a domicilio'          ,   29, 'Alicante/Alacant'                          , 'Entrenamiento en tu casa o en el parque, con lo que tengas. Planifico según tu edad y tus lesiones.'),
  (323, 'cliente'  , 'Cayetana D.' , 'Clases de inteligencia artificial'        ,   20, 'Alicante/Alacant'                          , 'Oigo hablar de la inteligencia artificial todo el día y no sé ni por dónde empezar.'),
  (324, 'cliente'  , 'César B.'    , 'Adiestramiento canino'                    ,   24, 'Alicante/Alacant'                          , 'Tira muchísimo de la correa y con otros perros se pone imposible.'),

  -- ── Almería ──
  (325, 'servicio' , 'Consuelo F.' , 'Mecánica ligera a domicilio'              ,   39, 'Almería'                                   , 'Cambio de aceite, filtros, pastillas y revisiones en tu garaje. Si hay que ir al taller, te lo digo claro.'),
  (326, 'servicio' , 'Cristóbal M.', 'Yoga y pilates a domicilio'               ,   29, 'Almería'                                   , 'Clases de yoga y pilates en casa, sola o en pareja. Llevo esterillas y adapto los ejercicios a lo tuyo.'),
  (327, 'cliente'  , 'Dolores H.'  , 'Barbería a domicilio'                     ,   15, 'Almería'                                   , 'Mi padre ya no sale de casa y necesita que alguien venga a cortarle el pelo.'),
  (328, 'cliente'  , 'Domingo J.'  , 'Alojamiento de mascotas'                  ,   16, 'Almería'                                   , 'Me voy diez días en agosto y quiero dejarla en una casa, no en una residencia.'),

  -- ── Asturias ──
  (329, 'servicio' , 'Edurne K.'   , 'Cambio de neumáticos o batería'           ,   34, 'Gijón'                                     , 'Ruedas y baterías en tu calle o en tu garaje. Llevo gato y herramienta, y me llevo lo viejo a reciclar.'),
  (330, 'servicio' , 'Elisa Q.'    , 'Podología a domicilio'                    ,   33, 'Gijón'                                     , 'Podóloga colegiada a domicilio. Uñas, durezas y pie diabético, con material estéril.'),
  (331, 'cliente'  , 'Encarna Z.'  , 'Maquillaje y peinado para eventos'        ,   45, 'Gijón'                                     , 'Me caso en junio y busco a alguien que venga a casa a peinarme y maquillarme.'),
  (332, 'cliente'  , 'Ernesto E.'  , 'Domótica y asistentes de voz'             ,   29, 'Gijón'                                     , 'Compré unas bombillas y un altavoz y no hay manera de que se entiendan entre ellos.'),

  -- ── Badajoz ──
  (333, 'servicio' , 'Esther X.'   , 'Lavado de moto, furgoneta o autocaravana' ,   29, 'Badajoz'                                   , 'Lavo motos, furgonetas y autocaravanas. Por fuera y por dentro, también antes de guardarlas una temporada.'),
  (334, 'servicio' , 'Eugenia W.'  , 'Enfermería a domicilio'                   ,   28, 'Badajoz'                                   , 'Enfermera colegiada. Curas, inyectables, sondas y control de constantes en casa, con parte escrito.'),
  (335, 'cliente'  , 'Fátima Y.'   , 'Manicura y pedicura'                      ,   20, 'Badajoz'                                   , 'Me cuesta agacharme y ya no puedo ocuparme yo de los pies.'),
  (336, 'cliente'  , 'Federico I.' , 'Cámaras y videovigilancia'                ,   34, 'Badajoz'                                   , 'Quiero ver la puerta desde el móvil cuando no estoy, pero sin liarme con cables.'),

  -- ── Barcelona ──
  (337, 'servicio' , 'Fermín O.'   , 'Llevar el coche a la ITV o al taller'     ,   23, 'Barcelona'                                 , 'Llevo el coche a la ITV o al taller y te lo devuelvo a casa. Te paso el informe y el resguardo por WhatsApp.'),
  (338, 'servicio' , 'Gema U.'     , 'Lavado de coche a domicilio'              ,   32, 'Barcelona'                                 , 'Si no queda como esperabas, vuelvo a pasar y no lo cobro.'),
  (339, 'cliente'  , 'Gerardo R.'  , 'Uñas esculpidas y esmaltado semipermanente',   24, 'Barcelona'                                 , 'Llevo semipermanente y busco a alguien cerca para el relleno cada tres semanas.'),
  (340, 'cliente'  , 'Gloria P.'   , 'Clases de informática e internet'         ,   19, 'Barcelona'                                 , 'El aparato ya lo tengo comprado, solo necesito que alguien lo deje andando.'),

  -- ── Bizkaia ──
  (341, 'servicio' , 'Gregorio C.' , 'Peluquería canina a domicilio'            ,   29, 'Bilbao'                                    , 'Peluquería canina en tu casa, sin jaulas ni esperas. Corte de raza o a tu gusto, uñas y oídos incluidos.'),
  (342, 'servicio' , 'Ignacio L.'  , 'Limpieza de tapicería y interiores'       ,   46, 'Bilbao'                                    , 'Si no queda como esperabas, vuelvo a pasar y no lo cobro.'),
  (343, 'cliente'  , 'Inés S.'     , 'Cejas y pestañas'                         ,   20, 'Bilbao'                                    , 'Quiero probar el laminado de cejas, pero prefiero que me lo expliquen antes.'),
  (344, 'cliente'  , 'Irene G.'    , 'Ayuda con trámites online'                ,   19, 'Bilbao'                                    , 'Con un par de tardes creo que me apaño, no busco un curso entero.'),

  -- ── Burgos ──
  (345, 'servicio' , 'Isidro T.'   , 'Baño y aseo de mascotas'                  ,   23, 'Burgos'                                    , 'Baño, secado y cepillado a domicilio. Llevo bañera propia y agua templada, también para gatos tranquilos.'),
  (346, 'servicio' , 'Jaime N.'    , 'Pulido y tratamiento de pintura'          ,   50, 'Burgos'                                    , 'Voy yo con todo el equipo: no necesitas ni toma de agua ni enchufe.'),
  (347, 'cliente'  , 'Jimena A.'   , 'Depilación'                               ,   20, 'Burgos'                                    , 'Busco a alguien que venga a casa, que con el bebé no puedo moverme.'),
  (348, 'cliente'  , 'Josefa V.'   , 'Clases de inteligencia artificial'        ,   26, 'Burgos'                                    , 'Puedo por las tardes o el fin de semana.'),

  -- ── Cantabria ──
  (349, 'servicio' , 'Juana D.'    , 'Paseo de perros'                          ,    9, 'Santander'                                 , 'Paseos de una hora, solos o en grupo pequeño. Te mando una foto y la ruta al terminar cada paseo.'),
  (350, 'servicio' , 'Julia B.'    , 'Mecánica ligera a domicilio'              ,   47, 'Santander'                                 , 'Trabajo también los fines de semana, que es cuando el coche está parado.'),
  (351, 'cliente'  , 'Leire F.'    , 'Fisioterapia a domicilio'                 ,   38, 'Santander'                                 , 'Salgo de una operación de rodilla y me han mandado rehabilitación en casa.'),
  (352, 'cliente'  , 'Leo M.'      , 'Barbería a domicilio'                     ,   19, 'Santander'                                 , 'Nunca me lo he hecho y agradecería que me aconsejaran.'),

  -- ── Castellón ──
  (353, 'servicio' , 'Lidia H.'    , 'Adiestramiento canino'                    ,   29, 'Castellón de la Plana/Castelló de la Plana', 'Adiestramiento en positivo, en casa y en la calle. Trabajo tirones de correa, ladridos y llamada.'),
  (354, 'servicio' , 'Lourdes J.'  , 'Cambio de neumáticos o batería'           ,   42, 'Castellón de la Plana/Castelló de la Plana', 'Trabajo también los fines de semana, que es cuando el coche está parado.'),
  (355, 'cliente'  , 'Lucía K.'    , 'Masaje y relajación'                      ,   38, 'Castellón de la Plana/Castelló de la Plana', 'Paso el día sentada delante del ordenador y tengo la espalda hecha polvo.'),
  (356, 'cliente'  , 'Luis Q.'     , 'Maquillaje y peinado para eventos'        ,   62, 'Castellón de la Plana/Castelló de la Plana', 'Prefiero que sea a domicilio, me viene mucho mejor.'),

  -- ── Ceuta ──
  (357, 'servicio' , 'Macarena Z.' , 'Alojamiento de mascotas'                  ,   18, 'Ceuta'                                     , 'Se queda en mi casa, con jardín y sin jaulas. Como mucho dos perros a la vez, para poder atenderlos bien.'),
  (358, 'servicio' , 'Marcelo E.'  , 'Lavado de moto, furgoneta o autocaravana' ,   37, 'Ceuta'                                     , 'Te doy el precio cerrado por foto, antes de moverme de casa.'),
  (359, 'cliente'  , 'Mariano X.'  , 'Entrenador personal a domicilio'          ,   24, 'Ceuta'                                     , 'Quiero volver a moverme, pero el gimnasio me da una pereza tremenda.'),
  (360, 'cliente'  , 'Maribel W.'  , 'Manicura y pedicura'                      ,   26, 'Ceuta'                                     , 'Sería una vez al mes, si nos entendemos bien.'),

  -- ── Ciudad Real ──
  (361, 'servicio' , 'Marisa Y.'   , 'Domótica y asistentes de voz'             ,   34, 'Ciudad Real'                               , 'Instalo y configuro altavoces, enchufes y bombillas inteligentes. Te lo dejo andando y te enseño a usarlo.'),
  (362, 'servicio' , 'Matilde I.'  , 'Llevar el coche a la ITV o al taller'     ,   29, 'Ciudad Real'                               , 'Voy yo con todo el equipo: no necesitas ni toma de agua ni enchufe.'),
  (363, 'cliente'  , 'Mercedes O.' , 'Yoga y pilates a domicilio'               ,   24, 'Ciudad Real'                               , 'Busco clases tranquilas en casa, que llevo años sin hacer deporte.'),
  (364, 'cliente'  , 'Miguel U.'   , 'Uñas esculpidas y esmaltado semipermanente',   33, 'Ciudad Real'                               , 'Nunca me lo he hecho y agradecería que me aconsejaran.'),

  -- ── Cuenca ──
  (365, 'servicio' , 'Milagros R.' , 'Cámaras y videovigilancia'                ,   39, 'Cuenca'                                    , 'Cámaras para casa, portal o local, con aviso al móvil. Monto, configuro y te explico qué se puede grabar y qué no.'),
  (366, 'servicio' , 'Nerea P.'    , 'Peluquería canina a domicilio'            ,   37, 'Cuenca'                                    , 'Tengo formación en primeros auxilios para animales.'),
  (367, 'cliente'  , 'Nieves C.'   , 'Podología a domicilio'                    ,   29, 'Cuenca'                                    , 'Mi madre no puede ir a la consulta y necesita que le corten las uñas.'),
  (368, 'cliente'  , 'Olalla L.'   , 'Cejas y pestañas'                         ,   29, 'Cuenca'                                    , 'Somos dos en casa y nos vendría bien a las dos.'),

  -- ── Cáceres ──
  (369, 'servicio' , 'Omar S.'     , 'Clases de informática e internet'         ,   17, 'Cáceres'                                   , 'Clases en tu casa y a tu ritmo: móvil, correo, videollamadas y banca. Sin prisas y sin palabras raras.'),
  (370, 'servicio' , 'Paco G.'     , 'Baño y aseo de mascotas'                  ,   29, 'Cáceres'                                   , 'Tengo formación en primeros auxilios para animales.'),
  (371, 'cliente'  , 'Paloma T.'   , 'Enfermería a domicilio'                   ,   24, 'Cáceres'                                   , 'Hay que ponerle una inyección cada semana y no podemos bajar al centro de salud.'),
  (372, 'cliente'  , 'Pascual N.'  , 'Depilación'                               ,   26, 'Cáceres'                                   , 'Prefiero que sea a domicilio, me viene mucho mejor.'),

  -- ── Cádiz ──
  (373, 'servicio' , 'Patricio A.' , 'Ayuda con trámites online'                ,   17, 'Jerez de la Frontera'                      , 'Te acompaño con la cita previa, el certificado digital y los trámites del Estado. Tú decides, yo te guío.'),
  (374, 'servicio' , 'Pepa V.'     , 'Paseo de perros'                          ,   12, 'Jerez de la Frontera'                      , 'Me manejo bien con animales mayores o miedosos, sin forzarlos.'),
  (375, 'cliente'  , 'Petra D.'    , 'Lavado de coche a domicilio'              ,   20, 'Jerez de la Frontera'                      , 'Lo tengo en un garaje comunitario y no me da la vida para llevarlo al túnel de lavado.'),
  (376, 'cliente'  , 'Quique B.'   , 'Fisioterapia a domicilio'                 ,   46, 'Jerez de la Frontera'                      , 'Tengo el informe del médico, por si sirve de referencia.'),

  -- ── Córdoba ──
  (377, 'servicio' , 'Rafael F.'   , 'Clases de inteligencia artificial'        ,   23, 'Córdoba'                                   , 'Te enseño a usar ChatGPT y parecidos en el día a día: escribir, traducir, organizarte. Desde cero.'),
  (378, 'servicio' , 'Ramiro M.'   , 'Adiestramiento canino'                    ,   37, 'Córdoba'                                   , 'Me gusta conocer antes al animal con una visita corta, sin compromiso.'),
  (379, 'cliente'  , 'Raquel H.'   , 'Limpieza de tapicería y interiores'       ,   30, 'Córdoba'                                   , 'Los asientos de atrás están imposibles, entre los niños y el perro.'),
  (380, 'cliente'  , 'Remedios J.' , 'Masaje y relajación'                      ,   46, 'Córdoba'                                   , 'Es para una persona mayor, así que hace falta paciencia.'),

  -- ── Gipuzkoa ──
  (381, 'servicio' , 'Ricardo K.'  , 'Barbería a domicilio'                     ,   17, 'Donostia/San Sebastián'                    , 'Corte y arreglo de barba en tu casa, con toalla caliente y navaja si te apetece. También para personas mayores.'),
  (382, 'servicio' , 'Rita Q.'     , 'Alojamiento de mascotas'                  ,   24, 'Donostia/San Sebastián'                    , 'Mando una foto o un mensaje cada día, para que estés tranquila.'),
  (383, 'cliente'  , 'Roberto Z.'  , 'Pulido y tratamiento de pintura'          ,   34, 'Donostia/San Sebastián'                    , 'Tiene arañazos de aparcar en la calle y quiero verlo decente antes de venderlo.'),
  (384, 'cliente'  , 'Rosario E.'  , 'Entrenador personal a domicilio'          ,   33, 'Donostia/San Sebastián'                    , 'Tengo el informe del médico, por si sirve de referencia.'),

  -- ── Girona ──
  (385, 'servicio' , 'Ruth X.'     , 'Maquillaje y peinado para eventos'        ,   52, 'Girona'                                    , 'Maquillaje y peinado para bodas, comuniones y bautizos. Voy a tu casa y salgo con tiempo de sobra.'),
  (386, 'servicio' , 'Sabina W.'   , 'Domótica y asistentes de voz'             ,   42, 'Girona'                                    , 'Si se puede resolver en remoto, lo hacemos así y sale más barato.'),
  (387, 'cliente'  , 'Samuel Y.'   , 'Mecánica ligera a domicilio'              ,   34, 'Girona'                                    , 'Le toca el cambio de aceite y entre semana no puedo acercarme al taller.'),
  (388, 'cliente'  , 'Sandra I.'   , 'Yoga y pilates a domicilio'               ,   33, 'Girona'                                    , 'Tengo el informe del médico, por si sirve de referencia.'),

  -- ── Granada ──
  (389, 'servicio' , 'Santiago O.' , 'Manicura y pedicura'                      ,   23, 'Granada'                                   , 'Manicura y pedicura en tu casa, con material esterilizado. También durezas y uñas encarnadas.'),
  (390, 'servicio' , 'Saúl U.'     , 'Cámaras y videovigilancia'                ,   47, 'Granada'                                   , 'No vendo aparatos: uso los que ya tienes siempre que sirvan.'),
  (391, 'cliente'  , 'Sebastián R.', 'Cambio de neumáticos o batería'           ,   29, 'Granada'                                   , 'Se queda sin batería cada dos por tres y las ruedas ya están para cambiarlas.'),
  (392, 'cliente'  , 'Susana P.'   , 'Podología a domicilio'                    ,   35, 'Granada'                                   , 'Serían sesiones seguidas, no una cosa suelta.'),

  -- ── Guadalajara ──
  (393, 'servicio' , 'Tamara C.'   , 'Uñas esculpidas y esmaltado semipermanente',   29, 'Guadalajara'                               , 'Semipermanente, acrílico y gel. Relleno cada tres o cuatro semanas y retirada sin dañar la uña.'),
  (394, 'servicio' , 'Telmo L.'    , 'Clases de informática e internet'         ,   21, 'Guadalajara'                               , 'No vendo aparatos: uso los que ya tienes siempre que sirvan.'),
  (395, 'cliente'  , 'Tomasa S.'   , 'Lavado de moto, furgoneta o autocaravana' ,   24, 'Guadalajara'                               , 'Tengo la autocaravana parada desde el verano y hay que dejarla presentable.'),
  (396, 'cliente'  , 'Ubaldo G.'   , 'Enfermería a domicilio'                   ,   30, 'Guadalajara'                               , 'Es para una persona mayor, así que hace falta paciencia.'),

  -- ── Huelva ──
  (397, 'servicio' , 'Urbano T.'   , 'Cejas y pestañas'                         ,   24, 'Huelva'                                    , 'Diseño de cejas, laminado y tinte. Extensiones y lifting de pestañas. Te enseño el resultado antes de fijar nada.'),
  (398, 'servicio' , 'Valeria N.'  , 'Ayuda con trámites online'                ,   21, 'Huelva'                                    , 'Te lo dejo por escrito, para que luego puedas repetirlo tú solo.'),
  (399, 'cliente'  , 'Vega A.'     , 'Llevar el coche a la ITV o al taller'     ,   20, 'Huelva'                                    , 'Me caduca la ITV y trabajo justo en el horario en que abren.'),
  (400, 'cliente'  , 'Vicente V.'  , 'Lavado de coche a domicilio'              ,   29, 'Huelva'                                    , 'Lo uso a diario, así que no puede quedarse muchas horas parado.'),

  -- ── Huesca ──
  (401, 'servicio' , 'Virginia D.' , 'Depilación'                               ,   23, 'Huesca'                                    , 'Depilación con cera tibia o con hilo, a domicilio. Material de un solo uso y cita a la hora que te venga bien.'),
  (402, 'servicio' , 'Ximena B.'   , 'Clases de inteligencia artificial'        ,   29, 'Huesca'                                    , 'Trabajo a menudo con gente mayor y sé ir despacio.'),
  (403, 'cliente'  , 'Yaiza F.'    , 'Peluquería canina a domicilio'            ,   24, 'Huesca'                                    , 'Tengo un cocker que se agobia mucho en la peluquería y prefiero que sea en casa.'),
  (404, 'cliente'  , 'Yeray M.'    , 'Limpieza de tapicería y interiores'       ,   41, 'Huesca'                                    , 'Lo uso a diario, así que no puede quedarse muchas horas parado.'),

  -- ── Illes Balears ──
  (405, 'servicio' , 'Zaira H.'    , 'Fisioterapia a domicilio'                 ,   52, 'Palma de Mallorca'                         , 'Tengo horario de mañana y de tarde, también fuera de la ciudad.'),
  (406, 'servicio' , 'Abel J.'     , 'Barbería a domicilio'                     ,   21, 'Palma de Mallorca'                         , 'Te digo con sinceridad lo que te va a favorecer y lo que no.'),
  (407, 'cliente'  , 'Aurora K.'   , 'Baño y aseo de mascotas'                  ,   26, 'Palma de Mallorca'                         , 'Busco a alguien de confianza y con paciencia, es lo que más valoro.'),
  (408, 'cliente'  , 'Benjamín Q.' , 'Pulido y tratamiento de pintura'          ,   45, 'Palma de Mallorca'                         , 'Lo tengo aparcado en la puerta de casa, sin problema de acceso.'),

  -- ── Jaén ──
  (409, 'servicio' , 'Casilda Z.'  , 'Masaje y relajación'                      ,   52, 'Jaén'                                      , 'La primera visita es para valorar, y de ahí sale el plan y el precio.'),
  (410, 'servicio' , 'Damián E.'   , 'Maquillaje y peinado para eventos'        ,   70, 'Jaén'                                      , 'Voy con todo el material, tú solo necesitas un sitio con luz.'),
  (411, 'cliente'  , 'Delia X.'    , 'Paseo de perros'                          ,   11, 'Jaén'                                      , 'Me gustaría que nos conociéramos antes de empezar.'),
  (412, 'cliente'  , 'Eloy W.'     , 'Mecánica ligera a domicilio'              ,   42, 'Jaén'                                      , 'Me viene mejor por la tarde o el fin de semana.'),

  -- ── La Rioja ──
  (413, 'servicio' , 'Adriana I.'  , 'Entrenador personal a domicilio'          ,   37, 'Logroño'                                   , 'Trabajo mucho con gente mayor y sé ir despacio.'),
  (414, 'servicio' , 'Álvaro O.'   , 'Manicura y pedicura'                      ,   29, 'Logroño'                                   , 'Trabajo con cita, así que no vas a esperar.'),
  (415, 'cliente'  , 'Amparo U.'   , 'Adiestramiento canino'                    ,   33, 'Logroño'                                   , 'Es muy buena, pero al principio desconfía de la gente que no conoce.'),
  (416, 'cliente'  , 'Andrea R.'   , 'Cambio de neumáticos o batería'           ,   38, 'Logroño'                                   , 'Lo uso a diario, así que no puede quedarse muchas horas parado.'),

  -- ── Las Palmas ──
  (417, 'servicio' , 'Aroa P.'     , 'Yoga y pilates a domicilio'               ,   37, 'Las Palmas de Gran Canaria'                , 'Voy con todo el material, no hace falta que compres nada.'),
  (418, 'servicio' , 'Asier C.'    , 'Uñas esculpidas y esmaltado semipermanente',   37, 'Las Palmas de Gran Canaria'                , 'Trabajo con cita, así que no vas a esperar.'),
  (419, 'cliente'  , 'Bárbara L.'  , 'Alojamiento de mascotas'                  ,   22, 'Las Palmas de Gran Canaria'                , 'Me gustaría que nos conociéramos antes de empezar.'),
  (420, 'cliente'  , 'Benito S.'   , 'Lavado de moto, furgoneta o autocaravana' ,   33, 'Las Palmas de Gran Canaria'                , 'No tengo prisa, pero sí quiero saber el precio por delante.'),

  -- ── León ──
  (421, 'servicio' , 'Blanca G.'   , 'Podología a domicilio'                    ,   39, 'León'                                      , 'Estoy colegiada y puedo darte el número si lo quieres comprobar.'),
  (422, 'servicio' , 'Carmen T.'   , 'Cejas y pestañas'                         ,   32, 'León'                                      , 'Material de un solo uso y todo desinfectado delante de ti.'),
  (423, 'cliente'  , 'Cayetana N.' , 'Domótica y asistentes de voz'             ,   38, 'León'                                      , 'Prefiero que sea en casa, que es donde tengo los aparatos.'),
  (424, 'cliente'  , 'César A.'    , 'Llevar el coche a la ITV o al taller'     ,   26, 'León'                                      , 'Lo tengo aparcado en la puerta de casa, sin problema de acceso.'),

  -- ── Lleida ──
  (425, 'servicio' , 'Consuelo V.' , 'Enfermería a domicilio'                   ,   34, 'Lleida'                                    , 'La primera visita es para valorar, y de ahí sale el plan y el precio.'),
  (426, 'servicio' , 'Cristóbal D.', 'Depilación'                               ,   29, 'Lleida'                                    , 'Voy con todo el material, tú solo necesitas un sitio con luz.'),
  (427, 'cliente'  , 'Dolores B.'  , 'Cámaras y videovigilancia'                ,   42, 'Lleida'                                    , 'El aparato ya lo tengo comprado, solo necesito que alguien lo deje andando.'),
  (428, 'cliente'  , 'Domingo F.'  , 'Peluquería canina a domicilio'            ,   33, 'Lleida'                                    , 'Busco a alguien de confianza y con paciencia, es lo que más valoro.'),

  -- ── Lugo ──
  (429, 'servicio' , 'Edurne M.'   , 'Lavado de coche a domicilio'              ,   38, 'Lugo'                                      , 'Llevo años en esto y tengo el seguro de responsabilidad civil al día.'),
  (430, 'servicio' , 'Elisa H.'    , 'Fisioterapia a domicilio'                 ,   58, 'Lugo'                                      , 'Voy con todo el material, no hace falta que compres nada.'),
  (431, 'cliente'  , 'Encarna J.'  , 'Clases de informática e internet'         ,   21, 'Lugo'                                      , 'Puedo por las tardes o el fin de semana.'),
  (432, 'cliente'  , 'Ernesto K.'  , 'Baño y aseo de mascotas'                  ,   30, 'Lugo'                                      , 'Es muy buena, pero al principio desconfía de la gente que no conoce.'),

  -- ── Madrid ──
  (433, 'servicio' , 'Esther Q.'   , 'Limpieza de tapicería y interiores'       ,   52, 'Madrid'                                    , 'Llevo años en esto y tengo el seguro de responsabilidad civil al día.'),
  (434, 'servicio' , 'Eugenia Z.'  , 'Masaje y relajación'                      ,   58, 'Madrid'                                    , 'Estoy colegiada y puedo darte el número si lo quieres comprobar.'),
  (435, 'cliente'  , 'Fátima E.'   , 'Ayuda con trámites online'                ,   21, 'Madrid'                                    , 'Es para mis padres, así que hace falta paciencia más que prisa.'),
  (436, 'cliente'  , 'Federico X.' , 'Paseo de perros'                          ,   13, 'Madrid'                                    , 'Serían días fijos entre semana, siempre a la misma hora.'),

  -- ── Melilla ──
  (437, 'servicio' , 'Fermín W.'   , 'Pulido y tratamiento de pintura'          ,   57, 'Melilla'                                   , 'Si no queda como esperabas, vuelvo a pasar y no lo cobro.'),
  (438, 'servicio' , 'Gema Y.'     , 'Entrenador personal a domicilio'          ,   43, 'Melilla'                                   , 'Si hace falta hablo con tu médico, para ir todos a una.'),
  (439, 'cliente'  , 'Gerardo I.'  , 'Clases de inteligencia artificial'        ,   30, 'Melilla'                                   , 'Prefiero que sea en casa, que es donde tengo los aparatos.'),
  (440, 'cliente'  , 'Gloria O.'   , 'Adiestramiento canino'                    ,   38, 'Melilla'                                   , 'Tiene su edad y necesita que vayan con calma.'),

  -- ── Murcia ──
  (441, 'servicio' , 'Gregorio U.' , 'Mecánica ligera a domicilio'              ,   53, 'Murcia'                                    , 'Voy yo con todo el equipo: no necesitas ni toma de agua ni enchufe.'),
  (442, 'servicio' , 'Ignacio R.'  , 'Yoga y pilates a domicilio'               ,   43, 'Murcia'                                    , 'La primera visita es para valorar, y de ahí sale el plan y el precio.'),
  (443, 'cliente'  , 'Inés P.'     , 'Barbería a domicilio'                     ,   21, 'Murcia'                                    , 'Somos dos en casa y nos vendría bien a las dos.'),
  (444, 'cliente'  , 'Irene C.'    , 'Alojamiento de mascotas'                  ,   25, 'Murcia'                                    , 'Serían días fijos entre semana, siempre a la misma hora.'),

  -- ── Málaga ──
  (445, 'servicio' , 'Isidro L.'   , 'Cambio de neumáticos o batería'           ,   48, 'Málaga'                                    , 'Voy yo con todo el equipo: no necesitas ni toma de agua ni enchufe.'),
  (446, 'servicio' , 'Jaime S.'    , 'Podología a domicilio'                    ,   43, 'Málaga'                                    , 'Trabajo mucho con gente mayor y sé ir despacio.'),
  (447, 'cliente'  , 'Jimena G.'   , 'Maquillaje y peinado para eventos'        ,   71, 'Málaga'                                    , 'Nunca me lo he hecho y agradecería que me aconsejaran.'),
  (448, 'cliente'  , 'Josefa T.'   , 'Domótica y asistentes de voz'             ,   43, 'Málaga'                                    , 'Con un par de tardes creo que me apaño, no busco un curso entero.'),

  -- ── Navarra ──
  (449, 'servicio' , 'Juana N.'    , 'Lavado de moto, furgoneta o autocaravana' ,   43, 'Pamplona/Iruña'                            , 'Trabajo también los fines de semana, que es cuando el coche está parado.'),
  (450, 'servicio' , 'Julia A.'    , 'Enfermería a domicilio'                   ,   38, 'Pamplona/Iruña'                            , 'Estoy colegiada y puedo darte el número si lo quieres comprobar.'),
  (451, 'cliente'  , 'Leire V.'    , 'Manicura y pedicura'                      ,   30, 'Pamplona/Iruña'                            , 'Prefiero que sea a domicilio, me viene mucho mejor.'),
  (452, 'cliente'  , 'Leo D.'      , 'Cámaras y videovigilancia'                ,   48, 'Pamplona/Iruña'                            , 'Puedo por las tardes o el fin de semana.'),

  -- ── Ourense ──
  (453, 'servicio' , 'Lidia B.'    , 'Llevar el coche a la ITV o al taller'     ,   33, 'Ourense'                                   , 'Si no queda como esperabas, vuelvo a pasar y no lo cobro.'),
  (454, 'cliente'  , 'Lourdes F.'  , 'Uñas esculpidas y esmaltado semipermanente',   38, 'Ourense'                                   , 'Somos dos en casa y nos vendría bien a las dos.'),

  -- ── Palencia ──
  (455, 'servicio' , 'Lucía M.'    , 'Peluquería canina a domicilio'            ,   43, 'Palencia'                                  , 'Me gusta conocer antes al animal con una visita corta, sin compromiso.'),
  (456, 'cliente'  , 'Luis H.'     , 'Cejas y pestañas'                         ,   34, 'Palencia'                                  , 'Es para un día concreto, así que necesito saber si tienes hueco.'),

  -- ── Pontevedra ──
  (457, 'servicio' , 'Macarena J.' , 'Baño y aseo de mascotas'                  ,   33, 'Vigo'                                      , 'Me gusta conocer antes al animal con una visita corta, sin compromiso.'),
  (458, 'cliente'  , 'Marcelo K.'  , 'Depilación'                               ,   30, 'Vigo'                                      , 'Nunca me lo he hecho y agradecería que me aconsejaran.'),

  -- ── Salamanca ──
  (459, 'servicio' , 'Mariano Q.'  , 'Paseo de perros'                          ,   14, 'Salamanca'                                 , 'Mando una foto o un mensaje cada día, para que estés tranquila.'),
  (460, 'cliente'  , 'Maribel Z.'  , 'Fisioterapia a domicilio'                 ,   52, 'Salamanca'                                 , 'Quiero saber antes el precio por sesión y cuántas harían falta.'),

  -- ── Santa Cruz de Tenerife ──
  (461, 'servicio' , 'Marisa E.'   , 'Adiestramiento canino'                    ,   43, 'Santa Cruz de Tenerife'                    , 'Si son dos animales de la misma casa, hago precio.'),
  (462, 'cliente'  , 'Matilde X.'  , 'Masaje y relajación'                      ,   52, 'Santa Cruz de Tenerife'                    , 'Serían sesiones seguidas, no una cosa suelta.'),

  -- ── Segovia ──
  (463, 'servicio' , 'Mercedes W.' , 'Alojamiento de mascotas'                  ,   28, 'Segovia'                                   , 'Tengo formación en primeros auxilios para animales.'),
  (464, 'cliente'  , 'Miguel Y.'   , 'Entrenador personal a domicilio'          ,   38, 'Segovia'                                   , 'Quiero saber antes el precio por sesión y cuántas harían falta.'),

  -- ── Sevilla ──
  (465, 'servicio' , 'Milagros I.' , 'Domótica y asistentes de voz'             ,   48, 'Sevilla'                                   , 'Te lo dejo por escrito, para que luego puedas repetirlo tú solo.'),
  (466, 'cliente'  , 'Nerea O.'    , 'Yoga y pilates a domicilio'               ,   38, 'Sevilla'                                   , 'Quiero saber antes el precio por sesión y cuántas harían falta.'),

  -- ── Soria ──
  (467, 'servicio' , 'Nieves U.'   , 'Cámaras y videovigilancia'                ,   53, 'Soria'                                     , 'Trabajo a menudo con gente mayor y sé ir despacio.'),
  (468, 'cliente'  , 'Olalla R.'   , 'Podología a domicilio'                    ,   38, 'Soria'                                     , 'Tengo el informe del médico, por si sirve de referencia.'),

  -- ── Tarragona ──
  (469, 'servicio' , 'Omar P.'     , 'Clases de informática e internet'         ,   24, 'Tarragona'                                 , 'Trabajo a menudo con gente mayor y sé ir despacio.'),
  (470, 'cliente'  , 'Paco C.'     , 'Enfermería a domicilio'                   ,   34, 'Tarragona'                                 , 'Serían sesiones seguidas, no una cosa suelta.'),

  -- ── Teruel ──
  (471, 'servicio' , 'Paloma L.'   , 'Ayuda con trámites online'                ,   24, 'Teruel'                                    , 'Voy con paciencia: explico las cosas las veces que haga falta.'),
  (472, 'cliente'  , 'Pascual S.'  , 'Lavado de coche a domicilio'              ,   34, 'Teruel'                                    , 'Es la primera vez que pido algo así, cuéntame cómo funciona.'),

  -- ── Toledo ──
  (473, 'servicio' , 'Patricio G.' , 'Clases de inteligencia artificial'        ,   33, 'Toledo'                                    , 'Si se puede resolver en remoto, lo hacemos así y sale más barato.'),
  (474, 'cliente'  , 'Pepa T.'     , 'Limpieza de tapicería y interiores'       ,   47, 'Toledo'                                    , 'Es la primera vez que pido algo así, cuéntame cómo funciona.'),

  -- ── Valencia ──
  (475, 'servicio' , 'Petra N.'    , 'Barbería a domicilio'                     ,   24, 'Valencia'                                  , 'Material de un solo uso y todo desinfectado delante de ti.'),
  (476, 'cliente'  , 'Quique A.'   , 'Pulido y tratamiento de pintura'          ,   51, 'Valencia'                                  , 'Lo uso a diario, así que no puede quedarse muchas horas parado.'),

  -- ── Valladolid ──
  (477, 'servicio' , 'Rafael V.'   , 'Maquillaje y peinado para eventos'        ,   80, 'Valladolid'                                , 'Te digo con sinceridad lo que te va a favorecer y lo que no.'),
  (478, 'cliente'  , 'Ramiro D.'   , 'Mecánica ligera a domicilio'              ,   48, 'Valladolid'                                , 'Lo tengo aparcado en la puerta de casa, sin problema de acceso.'),

  -- ── Zamora ──
  (479, 'servicio' , 'Raquel B.'   , 'Manicura y pedicura'                      ,   33, 'Zamora'                                    , 'Voy con todo el material, tú solo necesitas un sitio con luz.'),
  (480, 'cliente'  , 'Remedios F.' , 'Cambio de neumáticos o batería'           ,   43, 'Zamora'                                    , 'Es la primera vez que pido algo así, cuéntame cómo funciona.'),

  -- ── Zaragoza ──
  (481, 'servicio' , 'Ricardo M.'  , 'Uñas esculpidas y esmaltado semipermanente',   43, 'Zaragoza'                                  , 'Voy con todo el material, tú solo necesitas un sitio con luz.'),
  (482, 'cliente'  , 'Rita H.'     , 'Lavado de moto, furgoneta o autocaravana' ,   38, 'Zaragoza'                                  , 'Me viene mejor por la tarde o el fin de semana.'),

  -- ── Álava ──
  (483, 'servicio' , 'Roberto J.'  , 'Cejas y pestañas'                         ,   38, 'Vitoria-Gasteiz'                           , 'Si sois varias en la misma casa, hago precio.'),
  (484, 'cliente'  , 'Rosario K.'  , 'Llevar el coche a la ITV o al taller'     ,   30, 'Vitoria-Gasteiz'                           , 'Lo uso a diario, así que no puede quedarse muchas horas parado.'),

  -- ── Ávila ──
  (485, 'servicio' , 'Ruth Q.'     , 'Depilación'                               ,   33, 'Ávila'                                     , 'Te digo con sinceridad lo que te va a favorecer y lo que no.'),
  (486, 'cliente'  , 'Sabina Z.'   , 'Peluquería canina a domicilio'            ,   38, 'Ávila'                                     , 'Es muy buena, pero al principio desconfía de la gente que no conoce.')
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
                              or p.categoria = 'Alojamiento de mascotas'
                             then 'dia' else 'hora' end,
       -- La misma fecha que la cuenta, repartida hacia atrás, para que en
       -- el panel no aparezcan las 486 apiladas en el mismo minuto.
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
-- Debe salir, en cada fila: 243 perfiles, 82 categorías y 52 provincias.


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
