new Vue({
  el: "#app-vue",

  data: {
    /*************************************************
     * Datos que han de ser actualizados cada curso
     *************************************************/

    configTablasComunes: {
      apiKey: "AIzaSyDoeF-5Gqtp3TsOn9FeVjL8UrVywS9MJqA",
      authDomain: "ies-lab-tablas-comunes.firebaseapp.com",
      databaseURL: "https://ies-lab-tablas-comunes.firebaseio.com",
      projectId: "ies-lab-tablas-comunes",
      storageBucket: "ies-lab-tablas-comunes.appspot.com",
      messagingSenderId: "920323041317",
      appId: "1:920323041317:web:e0bcd937a35e5db7e0b7cc",
      measurementId: "G-84602D8151"
    },

    secondaryAppConfig: {
      apiKey: "AIzaSyD90-pfk0ZrAtenuaRHzJ-wW1-fLpp7BCs",
      authDomain: "ies-lab-asistencia.firebaseapp.com",
      databaseURL: "https://ies-lab-asistencia.firebaseio.com",
      projectId: "ies-lab-asistencia",
      storageBucket: "ies-lab-asistencia.appspot.com",
      messagingSenderId: "543864061010",
      appId: "1:543864061010:web:4820f84b72915dc675738b",
      measurementId: "G-5Q7KDJ64XJ"
    },

    // Sin actualizar aun...

    /*************************************************
     * Fin de datos que han de ser actualizados cada curso
     *************************************************/

    usuario: null,
    usuarioAutenticado: null,
    nombreDeUsuario: "Comprobando quién eres...",
    dbTablasComunes: null,
    dbSecundaria: null,
    mensajesProceso: "",

    faltasTotales :[],
    justificadas:null,
    materiasGrupo : [],
    faltasGrupoCargada: null,
    grupoSeleccionado: null,
    listadoGrupos: [],
    ordenado : null,
    alumnoSeleccionado: null,
    datosAlumnoSeleccionado: null,
    datosHorarioGrupoSeleccionado: [],
    datosMateriasAlumnoSeleccionado: [],
    numeroDeFaltasDelAlumnoSeleccionado: null,
    listadoMatriculasAlumnos:[],
    datosGrupoSeleccionado:[],
    listadoAlumnos: [],
    todosLosAlumnos: [],
    copiaArray: [],
    arrayMateriasAlumnos: [],
    copiaMateria: [],
    matriculaAComprobar : null,
    listadoFaltasAlumnosSeleccionado: [],
    faltasDelAlumnoCargadas: false,
    cargadoFaltasGrupo : false,
    cargandoTabla : false,
    estadosFalta: ["No justif.", "Justificada", ""],
    nombreCortoDeDia: ["L", "M", "X", "J", "V"],
    nombreCortoSesion: ["1", "2", "3", "4", "5", "6"],
    elUsuarioPuedeModificar: false,
    documentosRecibidosTablasComunesV2: 0,
    documentosRecibidosAsistenciaV2: 0,

    today: moment(),
    dateContext: moment(),
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "S", "D"],

    mesesNumeroATexto: [
      "",
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre"
    ],

    arrayEso: [
      "1A",
      "1B",
      "1AC",
      "1AB",
      "1C",
      "1D",
      "2A",
      "2B",
      "2C",
      "2P",
      "3A",
      "3B",
      "3C",
      "3D"
      ,"3P",
      "4A",
      "4B",
      "4C",
      "4D"
    ],
    diaDeHoy: moment().format("D [de] MMMM [de] YYYY"),

    materiaSeleccionada: "",
    hayFaltas: false,
    faltasFiltradas: {},

    faltasFiltradasPorFecha: [],
    faltasFiltradasPorMateria: {},

    tipoVisualizacion: "porFecha",

    mostrarJustificadas: true,
    mostrarNoJustificadas: true
  },

  computed: {
    year: function() {
      var t = this;
      return t.dateContext.format("Y");
    },
    month: function() {
      var t = this;
      return t.dateContext.format("MMMM");
    },
    anoCalendario: function() {
      return this.dateContext.year();
    },
    mesCalendario: function() {
      return this.dateContext.month() + 1;
    },
    daysInMonth: function() {
      var t = this;
      return t.dateContext.daysInMonth();
    },
    currentDate: function() {
      var t = this;
      return t.dateContext.get("date");
    },
    firstDayOfMonth: function() {
      var t = this;
      var firstDay = moment(t.dateContext).subtract(t.currentDate - 1, "days");
      return firstDay.weekday();
    },
    initialDate: function() {
      var t = this;
      return t.today.get("date");
    },
    initialMonth: function() {
      var t = this;
      return t.today.format("MMMM");
    },
    initialYear: function() {
      var t = this;
      return t.today.format("Y");
    },
    diasDelMes: function() {
      console.log("Redibujando los dias");
      let numeroDiaPrevio = 0;
      let numeroDiaActual = 1;
      let dias = [];
      for (let i = 0; i < 6; i++) {
        let semana = [];
        for (let j = 0; j < 7; j++) {
          if (numeroDiaPrevio < this.firstDayOfMonth) {
            semana.push("");
            numeroDiaPrevio++;
          } else {
            if (numeroDiaActual <= this.daysInMonth) {
              //Si es un día de diario...
              if (j < 5) {
                let objetoDia = {
                  numero: numeroDiaActual,
                  diaSemana: this.days[j],
                  sesiones: []
                };

                // Recorremos las sesiones...
                for (let k = 1; k <= 6; k++) {
                  let objetoSesion = {};
                  objetoSesion.sesion = k;
                  objetoSesion.materia = this.obtenerNombreMateriaAPartirDeDiaYSesion(
                    this.nombreCortoDeDia[j],
                    this.nombreCortoSesion[k - 1]
                  );
                  objetoSesion.falta = { estadoPendienteDeCambio: false };
                  if (this.listadoFaltasAlumnosSeleccionado != null) {
                    let faltaActual = undefined;
                    faltaActual = _.find(
                      this.listadoFaltasAlumnosSeleccionado,
                      {
                        ano: this.anoCalendario,
                        mes: this.mesCalendario,
                        dia: numeroDiaActual,
                        sesion: k.toString()
                      }
                    );
                    if (faltaActual !== undefined) {
                      objetoSesion.falta = faltaActual;
                    }
                  }
                  objetoDia.sesiones.push(objetoSesion);
                }
                semana.push(objetoDia);
              }
              numeroDiaActual++;
            }
          }
        }
        dias.push(semana);
      }
      if (this.firstDayOfMonth == 6) {
        dias.shift();
      }
      return dias;
    }
  },

  watch: {
    grupoSeleccionado: function(val, oldVal) {
      vueApp.faltasDelAlumnoCargadas = false;
      vueApp.materiaSeleccionada = "";
      vueApp.listadoFaltasAlumnosSeleccionado = [];
      vueApp.ordenado = false; 
      this.cargarListadoAlumnosDeUnGrupo();
      this.cargarHorariosGrupoSeleccionado();
      this.cambiarVariablesCalcularFaltasGrupoSeleccionado();
    },

    alumnoSeleccionado: function(val, oldVal) {
      
      this.cargarMateriasAlumnoSeleccionado();
      this.cargarFaltasAlumno();
      this.cargarDatosAlumnoSeleccionado();
      this.cambiarVariablesCalcularFaltasGrupoSeleccionado();
      vueApp.recalcularFaltas();
    },

    materiaSeleccionada: function(val, oldVal) {
      vueApp.recalcularFaltas();
    }
  },

  mounted: function() {
    window.vueApp = this;

    toastr.options = {
      closeButton: true,
      timeOut: 300000,
      extendedTimeOut: 300000,
      positionClass: "toast-top-center"
    };

    // Inicializamos la aplicacion de tablas comunes
    this.appFirebaseTablasComunes = firebase.initializeApp(
      vueApp.configTablasComunes
    );
    this.dbTablasComunes = this.appFirebaseTablasComunes.firestore();

    // Inicializamos la aplicacion actual (secundaria)
    this.appFirebaseSecundaria = firebase.initializeApp(
      vueApp.secondaryAppConfig,
      "secondary"
    );
    this.dbSecundaria = this.appFirebaseSecundaria.firestore();

    this.autenticarUsuarioYArrancarAplicacionVue();
  },

  methods: {
    autenticarUsuarioYArrancarAplicacionVue() {
      vueApp.nombreDeUsuario = "Comprobando quién eres...";

      console.log("Vamos a forzar la entrada como otro usuario...");

      var usuarioAutenticado = {
        id: window.location.search.split("usuario=")[1],
        nombre: "XXX",
        apellidos: "YYY"
      };

      console.log("A ver",window.location.search.split("usuario=")[1]);
      var referencia = this.dbTablasComunes.collection("emails-a-ids-profesores");
      referencia.where("id","==",window.location.search.split("usuario=")[1]).get()
      .then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
          var data = doc.data();
          usuarioAutenticado.nombre = data.nombre;
          usuarioAutenticado.apellidos = data.apellidos;
          
        })
        vueApp.usuarioAutenticado = usuarioAutenticado;
      vueApp.nombreDeUsuario =
        "Hola de nuevo, " +
        vueApp.usuarioAutenticado.nombre + " " +
        vueApp.usuarioAutenticado.apellidos +
        " (" +
        vueApp.usuarioAutenticado.id +
        ")!";
      vueApp.cargaLoNecesarioAntesDeEmpezar();
          });

        
      

      
    },
    cargaLoNecesarioAntesDeEmpezar() {
      vueApp.cargarListadoGrupos();
      vueApp.cargarTodosLosAlumnos();
      vueApp.comprobarSiElUsuarioPuedeModificar();
    },

    cambiarVariablesCalcularFaltasGrupoSeleccionado(){
      vueApp.cargandoTabla = false;
      vueApp.cargadoFaltasGrupo = false;
      vueApp.faltasDelAlumnoCargadas = false;
      vueApp.datosGrupoSeleccionado = [];
      vueApp.listadoFaltasAlumnosSeleccionado = [];
    },

    /*
    Método en el cual , recogemos las faltas de los alumnos del grupo seleccionado
    */
    cargarFaltasTotalesAlumnosGrupoSeleccionado(){
      vueApp.faltasTotales = [];
      vueApp.faltasDelAlumnoCargadas = false;
      vueApp.cargadoFaltasGrupo = false;
      vueApp.cargandoTabla = true;
      this.dbSecundaria.collection("faltas").where("grupo","==",vueApp.grupoSeleccionado).get()
      .then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
          var datos = doc.data();
          if(datos.hasOwnProperty("faltas")){
          var objeto = {};
          objeto.materia = datos.materia;
          objeto.matricula = datos.matricula;
          objeto.faltas = datos.faltas;
          vueApp.faltasTotales.push(objeto);
          }
        })
        console.log("Faltas totales grupo",vueApp.faltasTotales);
        
        vueApp.cargarMateriasDelGrupoSeleccionado();
      })
    },

    /*
      Método en el cual cargamos las materias del grupo seleccionado
    */
    cargarMateriasDelGrupoSeleccionado(){
    
     
       vueApp.materiasGrupo = [];
      vueApp.dbTablasComunes.collection("alu-gru").where("grupo","==",vueApp.grupoSeleccionado)
      .get()
      .then(function(querySnapshot){
          querySnapshot.forEach(function(doc){
            var datos = doc.data()
            var materia = datos.materia;
            vueApp.materiasGrupo.push(materia);
          })
          for(var i = 0; i < vueApp.arrayEso.length;i++){
          if(vueApp.grupoSeleccionado === vueApp.arrayEso[i]){
            vueApp.materiasGrupo.push("TUT");
            break;
          }
        }
          vueApp.materiasGrupo = _.uniqWith(vueApp.materiasGrupo);
          vueApp.materiasGrupo.sort(new Intl.Collator().compare);
          console.log("Materias Grupo Seleccionado" , vueApp.materiasGrupo);
          var copiaArray = []; // Copia de array del listado de alumno seleccionado
          copiaArray =  copiaArray.concat(vueApp.listadoAlumnos);
          vueApp.cargarMateriasYFaltasAlumnoGrupo(copiaArray);
          
      })
    },
    cargarListadoGrupos() {
      console.log("Cargando los grupos existentes en el Centro...");
      vueApp.mensajesProceso +=
        "Cargando los grupos existentes en el Centro...<br>";

      var referencia = this.dbTablasComunes.collection("grupos");
      referencia
        .get()
        .then(function(querySnapshot) {
          console.log("Grupos existentes recibidos!");
          vueApp.mensajesProceso += "Grupos existentes recibidos!!<br>";
          var grupos = [];
          querySnapshot.forEach(function(doc) {
            vueApp.documentosRecibidosTablasComunesV2++;
            grupos.push(doc.data());
          });
          vueApp.listadoGrupos = _.sortBy(_.map(grupos, "grupo"));
        })
        .catch(function(error) {
          console.log(
            "Error: se produjo un error obteniendo los grupos existentes en el centro",
            error
          );
          vueApp.mensajesProceso +=
            "Error: se produjo un error obteniendo los grupos existentes en el centro<br>";
        });
    },

    cargarTodosLosAlumnos() {
      console.log("Cargando los alumnos existentes en el Centro...");
      vueApp.mensajesProceso +=
        "Cargando los alumnos existentes en el Centro...<br>";

      var referencia = this.dbTablasComunes.collection("todos-los-alumnos");
      referencia
        .get()
        .then(function(querySnapshot) {
          console.log("Alumnos existentes recibidos!");
          vueApp.mensajesProceso +=
            "Alumnos matriculados en el Centro recibidos!!<br>";
          querySnapshot.forEach(function(doc) {
            vueApp.documentosRecibidosTablasComunesV2++;
            let objetoTodosLosAlumnos = doc.data();
            for (var matriculaActual in objetoTodosLosAlumnos) {
              if (objetoTodosLosAlumnos.hasOwnProperty(matriculaActual)) {
                vueApp.todosLosAlumnos.push({
                  matricula: matriculaActual,
                  nombreCompleto: objetoTodosLosAlumnos[matriculaActual]
                });
              }
            }
            vueApp.todosLosAlumnos.push(doc.data());
          });
        })
        .catch(function(error) {
          console.log(
            "Error: se produjo un error obteniendo los alumnos existentes en el centro",
            error
          );
          vueApp.mensajesProceso +=
            "Error: se produjo un error obteniendo los alumnos existentes en el centro<br>";
        });
    },

    cargarDatosAlumnoSeleccionado() {
      var procesoActual = "cargar los datos del alumno seleccionado";
      console.log("Iniciando el proceso de " + procesoActual);
      vueApp.mensajesProceso +=
        "Iniciando el proceso de " + procesoActual + "...<br>";

      var referencia = this.dbTablasComunes.collection("alumnos");
      referencia
        .where("matricula", "==", vueApp.alumnoSeleccionado)
        .get()
        .then(function(querySnapshot) {
          console.log("Recibidos los datos necesarios para " + procesoActual);
          vueApp.mensajesProceso +=
            "Recibidos los datos necesarios para " + procesoActual + "<br>";
          querySnapshot.forEach(function(doc) {
            vueApp.documentosRecibidosTablasComunesV2++;
            vueApp.datosAlumnoSeleccionado = doc.data();
            vueApp.datosAlumnoSeleccionado.fechaRealNacimiento = moment(
              vueApp.datosAlumnoSeleccionado.fechaNacimiento
            ).format("DD/MM/YYYY");
            vueApp.datosAlumnoSeleccionado.edad = moment().diff(
              vueApp.datosAlumnoSeleccionado.fechaNacimiento,
              "years"
            );
          });
        })
        .catch(function(error) {
          console.log("Error: se produjo un error al " + procesoActual, error);
          vueApp.mensajesProceso +=
            "Error: se produjo un error al " + procesoActual + "<br>";
        });
    },

    cargarHorariosGrupoSeleccionado() {
      var procesoActual =
        "obtener los datos de los horarios del grupo seleccionado";
      console.log("Iniciando el proceso de " + procesoActual);

      var referencia = this.dbTablasComunes.collection("horarios");
      referencia
        .where("grupo", "==", vueApp.grupoSeleccionado)
        .get()
        .then(function(querySnapshot) {
          console.log("Recibidos los datos necesarios para " + procesoActual);
          vueApp.datosHorarioGrupoSeleccionado = [];

          querySnapshot.forEach(function(doc) {
            vueApp.documentosRecibidosTablasComunesV2++;
            vueApp.datosHorarioGrupoSeleccionado.push(doc.data());
          });
        })
        .catch(function(error) {
          console.log("Error: se produjo un error al " + procesoActual, error);
        });
    },

    cargarMateriasAlumnoSeleccionado() {
      var procesoActual = "obtener las materias del alumno seleccionado";
      console.log("Iniciando el proceso de " + procesoActual);

      var referencia = this.dbTablasComunes.collection("alu-gru");
      referencia
        .where("matricula", "==", vueApp.alumnoSeleccionado)
        .get()
        .then(function(querySnapshot) {
          console.log("Recibidos los datos necesarios para " + procesoActual);
          vueApp.datosMateriasAlumnoSeleccionado = [];

          querySnapshot.forEach(function(doc) {
            vueApp.documentosRecibidosTablasComunesV2++;
            vueApp.datosMateriasAlumnoSeleccionado.push(doc.data());
          });
          console.log(vueApp.datosMateriasAlumnoSeleccionado);
        })
        
        .catch(function(error) {
          console.log("Error: se produjo un error al " + procesoActual, error);
        });
    },

    /*
    Método en el cual cargamos datos de los alumnos del grupo seleccionado
     */
    cargarMateriasYFaltasAlumnoGrupo(array){
      var procesoActual = "obtener las materias del alumno seleccionado";
      console.log("Iniciando el proceso de " + procesoActual);
      console.log(array);
      var arrayAlumno = []; //Array con --> Matricula, nombre y apellidos, datos de las materias del alumno
      if(array.length > 0){
        var alumnoPasado = array.shift();
        var arrayAsignaturas = [];
        
        var objetoMatricula = {};
        objetoMatricula.datosAMostrar = alumnoPasado.matricula;
        
        var objetoNombre = {};
        // Buscamos el nombre completo a traves de la matricula,en un array cargado anteriormente
        var alumnoActual = _.find(vueApp.todosLosAlumnos, {
          matricula:  alumnoPasado.matricula.toString()
        });
        var nombreCompleto =
          alumnoActual.nombreCompleto;
        objetoNombre.datosAMostrar = nombreCompleto;
        
        //Buscamos en la bd las asignaturas del alumno
      var referencia = this.dbTablasComunes.collection("alu-gru");
      referencia
        .where("matricula", "==", alumnoPasado.matricula).where("grupo","==",vueApp.grupoSeleccionado)
        .get()
        .then(function(querySnapshot) {
          console.log("Recibidos los datos necesarios para " + procesoActual);
          
          querySnapshot.forEach(function(doc) {
            var datos = doc.data();
            
           arrayAsignaturas.push(datos.materia);
           
          });
          
          console.log("Materias del grupo" , vueApp.grupoSeleccionado, vueApp.materiasGrupo);
          console.log("Materias del alumno" , nombreCompleto , arrayAsignaturas);
          
          var arrayAsignaturasQueNoTiene= [];
       

          console.log("Materias del alumno borradas" , nombreCompleto , arrayAsignaturas);
          console.log(arrayAsignaturas[1]);
          // A traves de este bucle, buscamos las materia que no tiene
          for(var i = 0; i < vueApp.materiasGrupo.length;i++){
            const result = arrayAsignaturas.includes(vueApp.materiasGrupo[i]);
            if(!result){
              console.log("No tiene",vueApp.materiasGrupo[i]);
              arrayAsignaturas.push(vueApp.materiasGrupo[i]);
              arrayAsignaturasQueNoTiene.push(vueApp.materiasGrupo[i]);
            }
            
            
          }

          //Ordenamos las asignaturas alfabeticamente
          arrayAsignaturas.sort(new Intl.Collator().compare);
          arrayAsignaturas = _.uniqWith(arrayAsignaturas);
          var arrayFaltas =[];

          if(arrayAsignaturasQueNoTiene.length > 0){
            // Bucles en el cual vamos creando los objetos para luego actualizarlos.
            //Si no tiene asignatura no tendra faltas por  lo que tendra doble guión
          for(var i = 0; i < arrayAsignaturas.length;i++){
              const result = arrayAsignaturasQueNoTiene.includes(arrayAsignaturas[i]);
              if(result){
                if(arrayAsignaturas[i] === "TUT"){
                  var objeto= {};
                  objeto.materia = arrayAsignaturas[i];
                  objeto.datosAMostrar = 0;
                  arrayFaltas.push(objeto);
                }
                else{
                  var objeto= {};
                objeto.materia = arrayAsignaturas[i];
                objeto.datosAMostrar = "--";
                arrayFaltas.push(objeto);
                }
              }
              else{
                var objeto= {};
              objeto.materia = arrayAsignaturas[i];
              objeto.datosAMostrar = 0;
              arrayFaltas.push(objeto);
              }

             
          
        }
      }
      else{
        //Bucle en el cual creamos los objetos para luego mostar los datos
        for(var i = 0; i < arrayAsignaturas.length;i++){
          var objeto= {};
          objeto.materia = arrayAsignaturas[i];
          objeto.datosAMostrar = 0;
          arrayFaltas.push(objeto);
        }
      }
          arrayAsignaturas = [];
          arrayAlumno = arrayAlumno.concat(arrayFaltas);
          arrayAlumno.unshift(objetoMatricula,objetoNombre);
          
          //Bucle en el cual, añadimos las faltas del alumno
          for(var i = 0; i < vueApp.faltasTotales.length;i++){
            if(vueApp.faltasTotales[i].matricula === alumnoPasado.matricula){
              for(var j = 2; j < arrayFaltas.length;j++){
                if(vueApp.faltasTotales[i].materia === arrayFaltas[j].materia){
                  console.log("Añadiendo falta " + alumnoPasado.matricula + arrayFaltas[j].materia + vueApp.faltasTotales[i].faltas);
                  arrayFaltas[j].datosAMostrar += vueApp.faltasTotales[i].faltas; 
                  
                }
              }
            }
          }
          
          


          vueApp.datosGrupoSeleccionado.push(arrayAlumno);
          
           console.log("Materias del alumno " + alumnoPasado.matricula + "" , vueApp.datosGrupoSeleccionado);

          //Utilizamos la recursividad para ir mirando todos los alumnos del grupo
          vueApp.cargarMateriasYFaltasAlumnoGrupo(array);
        })
        .catch(function(error) {
          console.log("Error: se produjo un error al " + procesoActual, error);
        });
      }
      else{
        console.log("Teminado de cargar la tabla de faltas",vueApp.grupoSeleccionado);
        vueApp.cargandoTabla = false;
        vueApp.cargadoFaltasGrupo = true;
      }
    },

   

    cargarFaltasDelGrupoSeleccionado(){
      console.log("Vamos a cargar los datos de los alumnos");  
      if(vueApp.listadoAlumnos.length > 0){
        console.log("Listado de alumos a rellenar");
        vueApp.cargarFaltasTotalesAlumnosGrupoSeleccionado();
      }
      else{
        vueApp.cargarListadoAlumnosDeUnGrupo();
        vueApp.copiaArray = vueApp.copiaArray.concat(vueApp.listadoAlumnos);
        vueApp.cargarFaltasTotalesAlumnosGrupoSeleccionado();
      }
      
    },

   

    


    comprobarSiElUsuarioPuedeModificar() {
      console.log("Cmprobando si tienes permiso para justificar faltas...");
      vueApp.mensajesProceso +=
        "Cmprobando si tienes permiso para justificar faltas...<br>";

      var referencia = this.dbTablasComunes.collection("roles");
      referencia
        .where("id", "==", vueApp.usuarioAutenticado.id)
        .get()
        .then(function(querySnapshot) {
          console.log(
            "Datos sobre los permisos que tienes concedidos recibidos!"
          );
          vueApp.mensajesProceso +=
            "Datos sobre los permisos que tienes concedidos recibidos!!<br>";
          querySnapshot.forEach(function(doc) {
            vueApp.documentosRecibidosTablasComunesV2++;
            vueApp.permisosUsuario = doc.data();
          });
        })
        .catch(function(error) {
          console.log(
            "Error: se produjo un error obteniendo los permisos que tienes concedidos",
            error
          );
          vueApp.mensajesProceso +=
            "Error: se produjo un error obteniendo los permisos que tienes concedidos<br>";
        });
    },

    cargarListadoAlumnosDeUnGrupo() {
      vueApp.listadoAlumnos = [];
      console.log(
        "Cargando los alumnos del grupo " + vueApp.grupoSeleccionado + "..."
      );
      vueApp.mensajesProceso +=
        "Cargando los alumnos del grupo " +
        vueApp.grupoSeleccionado +
        "...<br>";

      var referencia = this.dbTablasComunes.collection("matriculas");
      referencia
        .where("grupo", "==", vueApp.grupoSeleccionado)
        .get()
        .then(function(querySnapshot) {
          console.log(
            "Listado de matriculas de  " +
              vueApp.grupoSeleccionado +
              " recibidos"
          );
          vueApp.mensajesProceso +=
            "Listado de matriculas de  " +
            vueApp.grupoSeleccionado +
            " recibidos<br>";
          vueApp.listadoAlumnos = [];
          querySnapshot.forEach(function(doc) {
            vueApp.documentosRecibidosTablasComunesV2++;
            var elemento = {};
            elemento.matricula = doc.data().matricula;
            console.log("Buscando alumno " + elemento.matricula);
            var alumnoActual = _.find(vueApp.todosLosAlumnos, {
              matricula: elemento.matricula.toString()
            });
            console.log(alumnoActual);
            elemento.nombreCompleto =
              alumnoActual.nombreCompleto;
            vueApp.listadoAlumnos.push(elemento);
          });
          
          console.log("Sin ordenar",vueApp.listadoAlumnos);
          
         vueApp.ordenarAlumnos(vueApp.listadoAlumnos);
         console.log("Ordenado",vueApp.listadoAlumnos);
        })
        .catch(function(error) {
          console.log("Error obteniendo los alumnos:", error);
        });
    },

    /*
      Método en el cual ordenamos los alumnos para que salgan ordenados alfabeticmante
      teniendo en cuenta los caractéres especiales
    */
    ordenarAlumnos(array){
      var arrayNombres = []
      var arrayOrdenado = [];

      for(var i = 0; i < array.length;i++){
          arrayNombres.push(array[i].nombreCompleto); 
      }
      arrayNombres.sort(new Intl.Collator().compare);
    
      for(var j = 0; j < arrayNombres.length;j++){
        var matriculaActual = _.find(vueApp.todosLosAlumnos,{
          nombreCompleto : arrayNombres[j].toString()
        });
        var elemento = {};
        elemento.matricula = parseInt(matriculaActual.matricula)
        elemento.nombreCompleto = arrayNombres[j].toString() + " - " + elemento.matricula ;
        
        arrayOrdenado.push(elemento);
      }
      
      vueApp.listadoAlumnos = [];
      vueApp.listadoAlumnos = vueApp.listadoAlumnos.concat(arrayOrdenado);
      vueApp.ordenado = true;
    },

    cargarFaltasAlumno() {
      vueApp.listadoFaltasAlumnosSeleccionado = [];
      vueApp.numeroDeFaltasDelAlumnoSeleccionado = 0;
      console.log(
        "Cargando las faltas del alumno" +
          vueApp.listadoFaltasAlumnosSeleccionado +
          "..."
      );
      vueApp.mensajesProceso +=
        "Cargando las faltas del alumno" +
        vueApp.listadoFaltasAlumnosSeleccionado +
        "...<br>";

      var referencia = this.dbSecundaria.collection("faltas");
      referencia
        .where("matricula", "==", vueApp.alumnoSeleccionado)
        .get()
        .then(function(querySnapshot) {
          console.log(
            "Listado de faltas del alumno  " +
              vueApp.alumnoSeleccionado +
              " recibidas"
          );
          vueApp.mensajesProceso +=
            "Listado de faltas del alumno  " +
            vueApp.alumnoSeleccionado +
            " recibidas<br>";
          vueApp.listadoFaltasAlumnosSeleccionado = [];
          
          querySnapshot.forEach(function(doc) {
            vueApp.documentosRecibidosAsistenciaV2++;
            var elemento = {};
            elemento = doc.data();
            elemento.id = doc.id;
            elemento.estadoPendienteDeCambio = false;
            if(elemento.hasOwnProperty("faltas")){
              vueApp.numeroDeFaltasDelAlumnoSeleccionado += elemento.faltas;
            }
            
            if (typeof elemento.justificadas == "undefined") {
              elemento.justificadas = 0;
            }

            if (elemento.faltas == 1 && elemento.justificadas == 0) {
              elemento.estado = vueApp.estadosFalta[0]; // No justificada
            } else if (elemento.faltas == 1 && elemento.justificadas == 1) {
              elemento.estado = vueApp.estadosFalta[1]; // Justificada
            } else if (elemento.faltas == 0) {
              elemento.estado = vueApp.estadosFalta[2]; // Sin falta
            }
            var mesReal = elemento.mes < 10 ? "0" + elemento.mes : elemento.mes;
            var diaReal = elemento.dia < 10 ? "0" + elemento.dia : elemento.dia;

            elemento.fecha = moment(
              elemento.ano + "-" + mesReal + "-" + diaReal
            ).format("dddd, D [de] MMMM [de] YYYY");
            vueApp.listadoFaltasAlumnosSeleccionado.push(elemento);
          });
          console.log("Numero de faltas" , vueApp.listadoFaltasAlumnosSeleccionado.length);
          vueApp.faltasDelAlumnoCargadas = true;
          vueApp.recalcularFaltas();
        })
        .catch(function(error) {
          console.log(
            "Error obteniendo las faltas del alumno " +
              vueApp.alumnoSeleccionado +
              ":",
            error
          );
        });
    },

    recalcularFaltas() {
      console.log(vueApp.listadoFaltasAlumnosSeleccionado);
      var arrayTemporalSinDuplicadosDeFaltas = _.uniqWith(
        vueApp.listadoFaltasAlumnosSeleccionado,
        function(first, second) {
          return (
            first.ano === second.ano &&
            first.mes == second.mes &&
            first.dia == second.dia &&
            first.sesion == second.sesion &&
            first.faltas == second.faltas &&
            first.justificadas == second.justificadas
          );
        }
      );
      console.log("Array temporal sin duplicados de faltas:");
      console.log(arrayTemporalSinDuplicadosDeFaltas);

      arrayTemporalSinDuplicadosDeFaltas = _.filter(
        arrayTemporalSinDuplicadosDeFaltas,
        function(elemento) {
          return (
            elemento.faltas > 0 &&
            ((vueApp.mostrarJustificadas &&
              elemento.estado == vueApp.estadosFalta[1]) ||
              (vueApp.mostrarNoJustificadas &&
                elemento.estado == vueApp.estadosFalta[0]))
          );
        }
      );
      console.log(arrayTemporalSinDuplicadosDeFaltas);

      var arrayTemporalOrdenado = _.orderBy(
        arrayTemporalSinDuplicadosDeFaltas,
        ["ano", "mes", "dia", "sesion"],
        ["asc", "asc", "asc", "asc"]
      );
      console.log(arrayTemporalOrdenado);

      var arrayFiltradoPorMateria = arrayTemporalOrdenado;

      if (vueApp.materiaSeleccionada.length > 0) {
        arrayFiltradoPorMateria = _.filter(arrayFiltradoPorMateria, function(
          elemento
        ) {
          if (elemento.materia == vueApp.materiaSeleccionada) return elemento;
        });
      }

      var arrayFiltradoPorMateria2 = JSON.parse(
        JSON.stringify(arrayFiltradoPorMateria)
      );

      var objetoAgrupadoPorFecha = _.groupBy(arrayFiltradoPorMateria, function(
        elemento
      ) {
        var fecha = moment(
          elemento.ano + "-" + elemento.mes + "-" + elemento.dia
        ).format("dddd, D [de] MMMM [de] YYYY");
        return (
          fecha.substring(0, 1).toUpperCase() + fecha.substring(1, fecha.length)
        );
      });

      var objetoAgrupadoPorMateria = _.groupBy(
        arrayFiltradoPorMateria2,
        function(elemento) {
          return elemento.materia;
        }
      );

      if (!_.isEmpty(objetoAgrupadoPorFecha)) {
        vueApp.hayFaltas = true;
      } else {
        vueApp.hayFaltas = false;
      }
      vueApp.numeroDeFaltasDelAlumnoSeleccionado = arrayTemporalOrdenado.length;
      vueApp.faltasFiltradasPorFecha = objetoAgrupadoPorFecha;
      vueApp.faltasFiltradasPorMateria = objetoAgrupadoPorMateria;
      console.log("Ver faltas",vueApp.faltasFiltradasPorMateria);
      vueApp.faltasFiltradas = [];
    },

    addMonth() {
      var t = this;
      t.dateContext = moment(t.dateContext).add(1, "month");
    },

    subtractMonth() {
      var t = this;
      t.dateContext = moment(t.dateContext).subtract(1, "month");
    },

    getClassSesion(sesion) {
      if (sesion.falta != null) {
        console.log("Comprobando clase CSS de la sesión..");

        if (sesion.falta.estadoPendienteDeCambio) {
          return "sesion-pendiente-cambio";
        } else {
          if (sesion.falta.estado == "No justif.") {
            return "sesion-con-falta";
          } else if (sesion.falta.estado == "Justificada") {
            return "sesion-con-falta-justificada";
          } else {
            return "";
          }
        }
      } else {
        return "";
      }
    },

    getClassDia(dia) {
      if (dia == "") {
        return "";
      } else {
        return "dia-interno";
      }
    },

    obtenerNombreMateriaAPartirDeDiaYSesion(dia, sesion) {
      let materia = "";
      let arrayMaterias = _.filter(
        vueApp.datosHorarioGrupoSeleccionado,
        function(elemento) {
          if (
            elemento.sesion === sesion &&
            elemento.grupo === vueApp.grupoSeleccionado &&
            elemento.dia === dia
          ) {
            return elemento;
          }
        }
      );

      //console.log("Dia: " + dia + " / Sesion: " + sesion);
      //console.log(arrayMaterias);

      let i = 0;
      while (i < arrayMaterias.length && materia === "") {
        if (arrayMaterias[i].materia === "TUT") {
          materia = "TUT";
        }

        if (
          _.findIndex(vueApp.datosMateriasAlumnoSeleccionado, function(
            elemento
          ) {
            return elemento.materia == arrayMaterias[i].materia;
          }) !== -1
        ) {
          materia = arrayMaterias[i].materia;
        }
        i++;
      }

      return materia;
    },

    obtenerEstadoFalta(sesion) {
      if (sesion.falta.estadoPendienteDeCambio) {
        return "Cambiando...";
      } else {
        return sesion.falta.estado;
      }
    },

   

    obtenerEnlaceFoto(matricula) {
      return (
        "https://firebasestorage.googleapis.com/v0/b/ies-asistencia-2017.appspot.com/o/" +
        matricula +
        ".jpg?alt=media&token=a21f3d7e-2dc7-4e1a-b1d3-beed09b31162"
      );
    },

    datosCargados: function() {
      return this.alumnos != null && this.model.grupo !== "";
    },

    selecionarVistaPorFechas() {
      vueApp.tipoVisualizacion = "porFecha";
    },

    selecionarVistaPorMaterias() {
      vueApp.tipoVisualizacion = "porMateria";
    },

    cambiarMostrarJustificadas(mostrarONo) {
      console.log(
        "Activando o desactivando que se muestren las justificadas..."
      );
      vueApp.mostrarJustificadas = mostrarONo;
      
      console.log("A ver el valor",vueApp.mostrarJustificadas);
      vueApp.recalcularFaltas();
    },

    cambiarMostrarNoJusticadas(mostrarONo) {
      console.log(
        "Activando o desactivando que se muestren las no justificadas..."
      );
      vueApp.mostrarNoJustificadas = mostrarONo;
     
      console.log("A ver el valor",vueApp.mostrarNoJustificadas);
      vueApp.recalcularFaltas();
    }
  }
});
