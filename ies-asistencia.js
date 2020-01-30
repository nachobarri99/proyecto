String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};



window.vueApp = new Vue({
  el: '#app-vue',

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
    
    seCarganLasEdadesDeLosAlumnos: true,

    usuario: null,
    usuarioAutenticado: null,
    conectandoUsuario: false,
    credencialesUsuario: null,

    permisosUsuario: null,

    nombreDeUsuario: "",

    providerGoogle: null,
    appFirebaseTablasComunes: null,
    appFirebaseSecundaria: null,
    appFirebaseTercera: null,
    appFirebaseCuarta: null,
    dbTablasComunes: null,
    dbSecundaria: null,
    dbTercera: null,
    dbCuarta: null,

    cargando: true,

    cargandoAlumnoSesionSeleccionada: false,

    fechaSeleccionada: "",
    sesionSeleccionada: null,
    materiaSeleccionada: null,
    gruposSeleccionados: null,

    sesiones: ["1", "2", "3", "4", "5", "6", "V1", "V2", "V3", "V4", "V5", "V6"],
    dias: ["L", "M", "X", "J", "V", "S", "D"],

    sesionYHora: {
      "1": "8:35",
      "2": "9:30",
      "3": "10:25",
      "4": "11:45",
      "5": "12:40",
      "6": "13:35",
      "V1": "15:20",
      "V2": "16:10",
      "V3": "17:00",
      "V4": "18:05",
      "V5": "18:55",
      "V6": "19:45",
    },

    sesionesProfesorSeleccionado: [],
    sesionesProfesorCargadas: false,

    profesorTieneTurnoTarde: false,
    profesorTieneTurnoManana: false,

    datosDeGruposRecibidos: 0,
    gruposDeLosQueSeDebenDeRecibirDatos: 0,

    alumnosDelGrupoEnPantalla: [],
    numeroGruposPendienteDeCarga: 0,

    arrayTemporalAlumnosParaCargarDatos: [],
    cargadosTodosLosDatosDeLosAlumnosEnPantalla: false,

    numeroAlumnosLeidasFaltasPreexistentes: 0,
    faltasPreexistentesGrupoSeleccionado: {},
    cargadasFaltasPreexitentes: false,

    turnoDeManana: false,
    turnoDeTarde: false,

  },

  computed: {

    fechaSeleccionadaEnTexto() {
      if (this.fechaSeleccionada !== "") {
        return moment(this.fechaSeleccionada, "YYYY-MM-DD").format('D [de] MMMM [de] YYYY, dddd');
      }
      else {
        return "";
      }
    },


    diaSeleccionado() {
      return vueApp.dias[moment(vueApp.fechaSeleccionada, "YYYY-MM-DD").weekday()];
    }



  },



  mounted: function () {

    console.log("Vue iniciado");

    window.vueApp = this;

    // Inicializamos la aplicacion de tablas comunes
    this.appFirebaseTablasComunes = firebase.initializeApp(vueApp.configTablasComunes);
    this.dbTablasComunes = this.appFirebaseTablasComunes.firestore();

    // Inicializamos la aplicacion actual (secundaria)
    this.appFirebaseSecundaria = firebase.initializeApp(vueApp.secondaryAppConfig, "secondary");
    this.dbSecundaria = this.appFirebaseSecundaria.firestore();
    

    console.log("Aplicación VueJS montada!");

    this.autenticarUsuarioYArrancarAplicacionVue();

  },


  watch: {

    'fechaSeleccionada': function (val, oldVal) {
      vueApp.alumnosDelGrupoEnPantalla = [];
      vueApp.sesionSeleccionada = null;
      vueApp.materiaSeleccionada = null;
    },


  },


  filters: {

    verFechaConDia(fecha) {
      return moment(fecha).format('DD [de] MMMM [de] YYYY, dddd ') + "(" + moment(fecha).fromNow() + ")";
    },


    toProperCase(texto) {
      return texto.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    },


    momentoAFechaLegible(momento) {
      return moment(momento).fromNow();
    },


    soloDia(texto) {
      return moment(texto, "DD/MM/YYYY").format("DD");
    },


    soloDia2(texto) {
      return moment(texto, "YYYY-MM-DD").format("DD");
    },



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

      vueApp.usuarioAutenticado = usuarioAutenticado;
      vueApp.nombreDeUsuario = "Hola de nuevo, " + vueApp.usuarioAutenticado.nombre + " (" + vueApp.usuarioAutenticado.id + ")!";
      vueApp.cargarDatos();

    },



    cargarDatos() {
      this.fechaSeleccionada = moment().format("YYYY-MM-DD");
      this.cargarSesionesProfesor();
    },


    aumentarFecha() {
      console.log("Haciendo avanzar la fecha");
      if (moment(vueApp.fechaSeleccionada, "YYYY-MM-DD").weekday() != 4) {
        vueApp.fechaSeleccionada = moment(vueApp.fechaSeleccionada, "YYYY-MM-DD").add(1, 'd').format("YYYY-MM-DD");
      }
      else {
        vueApp.fechaSeleccionada = moment(vueApp.fechaSeleccionada, "YYYY-MM-DD").add(3, 'd').format("YYYY-MM-DD");
      }
    },


    reducirFecha() {
      console.log("Retrocediendo la fecha");
      if (moment(vueApp.fechaSeleccionada, "YYYY-MM-DD").weekday() != 0) {
        vueApp.fechaSeleccionada = moment(vueApp.fechaSeleccionada, "YYYY-MM-DD").subtract(1, 'd').format("YYYY-MM-DD");
      }
      else {
        vueApp.fechaSeleccionada = moment(vueApp.fechaSeleccionada, "YYYY-MM-DD").subtract(3, 'd').format("YYYY-MM-DD");
      }
    },


    cargarSesionesProfesor() {
      var procesoActual = "cargar las sesiones del profesor que usa la aplicacion";
      console.log("Iniciando el proceso de " + procesoActual);

      vueApp.dbTablasComunes.collection("horarios").where("profesor", "==", vueApp.usuarioAutenticado.id).get()
        .then(function (querySnapshot) {
          console.log("Recibidos los datos necesarios para " + procesoActual);
          querySnapshot.forEach(function (doc) {
            console.log(doc.id, " => ", doc.data());
            vueApp.sesionesProfesorSeleccionado.push(doc.data());
          });

          vueApp.sesionesProfesorSeleccionado.forEach(function (elemento) {
            var inicialSesion = elemento.sesion.substring(0, 1);
            var materia = elemento.materia;
            if (inicialSesion === "V" && materia !== "") {
              vueApp.profesorTieneTurnoTarde = true;
            }
            else if (inicialSesion !== "V" && materia !== "") {
              vueApp.profesorTieneTurnoManana = true;
            }
          });

          vueApp.sesionesProfesorCargadas = true;

        })
        .catch(function (error) {
          console.log("Error: se produjo un error al " + procesoActual, error);
        });
    },


    obtenerTextoSesion(sesion) {
      var materiaADevolver = "";
      var gruposADevolver = "";
      vueApp.sesionesProfesorSeleccionado.forEach(function (elemento) {
        if (elemento.sesion == sesion && elemento.dia == vueApp.diaSeleccionado && elemento.materia !== "") {
          materiaADevolver = elemento.materia;
          if (elemento.grupo !== "") {
            gruposADevolver += elemento.grupo + ", "
          }
        }
      })
      if (gruposADevolver.length > 0) {
        gruposADevolver = " (" + gruposADevolver.substring(0, gruposADevolver.length - 2) + ")";
      }
      return materiaADevolver + gruposADevolver;
    },



    obtenerClaseSesion(sesion) {
      if (sesion.substring(0, 1) === "V" && !this.profesorTieneTurnoTarde) {
        return "list-group-item list-group-item-action sesion-no-visible";
      }
      if (sesion.substring(0, 1) !== "V" && !this.profesorTieneTurnoManana) {
        return "list-group-item list-group-item-action sesion-no-visible";
      }
      if (sesion == vueApp.sesionSeleccionada) {
        return "list-group-item list-group-item-action active";
      }
      else {
        return "list-group-item list-group-item-action";
      }

    },


    seleccionarSesion(sesion) {
      vueApp.cargandoAlumnoSesionSeleccionada = true;
      vueApp.sesionSeleccionada = sesion;
      vueApp.alumnosDelGrupoEnPantalla = [];

      vueApp.gruposSeleccionados = this.obtenerGrupos(vueApp.diaSeleccionado, sesion);
      vueApp.materiaSeleccionada = this.obtenerMateria(vueApp.diaSeleccionado, sesion);

      vueApp.numeroGruposPendienteDeCarga = vueApp.gruposSeleccionados.length;

      console.log("Cargando los alumnos de los grupos " + vueApp.gruposSeleccionados);

      vueApp.gruposSeleccionados.forEach(function (elemento) {
        var procesoActual = "cargar las sesiones del dia seleccionado";
        console.log("Iniciando el proceso de " + procesoActual);


        vueApp.dbTablasComunes.collection("alu-gru").where("grupo", "==", elemento).where("materia", "==", vueApp.materiaSeleccionada).get()
          .then(function (querySnapshot) {

            var arrayTemporalAlumnos = [];

            console.log("Recibidos los datos necesarios para " + procesoActual);
            querySnapshot.forEach(function (doc) {

              var alumnoActual = doc.data();

              //Solo mostramos el alumno si es alumno del profesor actual o si no tiene definido profesor
              if (alumnoActual.profesor == vueApp.usuarioAutenticado.id || alumnoActual.profesor == "") {
                alumnoActual.nombre = vueApp.sinAcentos(alumnoActual.nombre);
                alumnoActual.apellidos = vueApp.sinAcentos(alumnoActual.apellidos);
                alumnoActual.eseAlumnoFalto = false;
                alumnoActual.laFaltaDelAlumnoEstaJustificada = false;
                alumnoActual.faltaIntroducidaPorElTutor = false;
                alumnoActual.llegoConRetraso = false;
                alumnoActual.poniendoFalta = false;
                alumnoActual.quitandoFalta = false;
                alumnoActual.poniendoFaltaConSMS = false;
                alumnoActual.poniendoRetraso = false;
                alumnoActual.quitandoRetraso = false;
                alumnoActual.convirtiendoRetrasoEnFalta = false;
                alumnoActual.convirtiendoFaltaEnRetraso = false;
                alumnoActual.datos = {};
                alumnoActual.datos.edad = null;
                alumnoActual.datos.movilMadre = "";
                alumnoActual.datos.movilPadre = "";
                alumnoActual.padresAvisadosPorSms = false;

                if (window.location.search.includes("debug")) {
                  console.log(doc.id + ": ");
                  console.log(alumnoActual);
                }

                arrayTemporalAlumnos.push(alumnoActual);
              }


            });

            vueApp.alumnosDelGrupoEnPantalla = vueApp.alumnosDelGrupoEnPantalla.concat(arrayTemporalAlumnos);

            vueApp.numeroGruposPendienteDeCarga--;

            if (vueApp.numeroGruposPendienteDeCarga == 0) {
              vueApp.alumnosDelGrupoEnPantalla.sort(vueApp.compararPorApellido);
              vueApp.arrayTemporalAlumnosParaCargarDatos = vueApp.alumnosDelGrupoEnPantalla.slice(0);

              vueApp.cargadosTodosLosDatosDeLosAlumnosEnPantalla = false;

              if (vueApp.seCarganLasEdadesDeLosAlumnos) {
                vueApp.cargarDatosAlumnosRecursivamente();
              }
              

              vueApp.solicitarFaltasDelGrupoSeleccionado();
            }

          })
          .catch(function (error) {
            console.log("Error: se produjo un error al " + procesoActual, error);
          });
      })


    },


    obtenerGrupos(dia, sesion) {
      var aDevolver = [];
      vueApp.sesionesProfesorSeleccionado.forEach(function (elemento) {
        if (elemento.dia == dia && elemento.sesion == sesion && elemento.materia !== "") {
          aDevolver.push(elemento.grupo);
        }
      })
      return aDevolver;
    },


    obtenerMateria(dia, sesion) {
      var aDevolver = "";
      vueApp.sesionesProfesorSeleccionado.forEach(function (elemento) {
        if (elemento.dia == dia && elemento.sesion == sesion && elemento.materia !== "") {
          aDevolver = elemento.materia;
        }
      })
      return aDevolver;
    },


    obtenerEnlaceFoto(matricula) {
      return "https://firebasestorage.googleapis.com/v0/b/ies-lab-asistencia.appspot.com/o/" + matricula + ".jpg?alt=media&token=a21f3d7e-2dc7-4e1a-b1d3-beed09b31162";
    },


    compararPorApellido(a, b) {
      if (a.apellidos < b.apellidos)
        return -1;
      if (a.apellidos > b.apellidos)
        return 1;
      return 0;
    },


    solicitarFaltasDelGrupoSeleccionado() {
      vueApp.cargadasFaltasPreexitentes = false;

      vueApp.numeroAlumnosLeidasFaltasPreexistentes = 0;
      vueApp.faltasPreexistentesGrupoSeleccionado = {};

      var anoSelec = vueApp.fechaSeleccionada.substring(0, 4);
      var mesSelec = vueApp.fechaSeleccionada.substring(5, 7);
      var diaSelec = vueApp.fechaSeleccionada.substring(8, 10);

      console.log('Preguntando a Firebase por las faltas el ' + anoSelec + "/" + mesSelec + "/" + diaSelec + " en sesion " + vueApp.sesionSeleccionada + " en materia " + vueApp.materiaSeleccionada);

      vueApp.dbSecundaria.collection("faltas")
        .where("ano", "==", Number(anoSelec))
        .where("mes", "==", Number(mesSelec))
        .where("dia", "==", Number(diaSelec))
        .where("sesion", "==", vueApp.sesionSeleccionada)
        .where("materia", "==", vueApp.materiaSeleccionada)
        .get()
        .then(function (datosRecibidos) {
          console.log("Datos recibidos de Firestore:");
          console.log(datosRecibidos);
          datosRecibidos.forEach(function (doc) {
            console.log("Datos de un documento recibido:");

            var elementoFaltaPreexistente = doc.data();
            elementoFaltaPreexistente.id = doc.id;

            var alumnoSobreElQueVersaLaFalta = vueApp.obtenerAlumnoEnPantallaPorMatricula(elementoFaltaPreexistente.matricula);
            if (alumnoSobreElQueVersaLaFalta != null) {

              if (elementoFaltaPreexistente.faltas == 1) {
                alumnoSobreElQueVersaLaFalta.eseAlumnoFalto = true;
              }
              if (elementoFaltaPreexistente.justificadas == 1) {
                alumnoSobreElQueVersaLaFalta.laFaltaDelAlumnoEstaJustificada = true;
              }
              if (_.has(elementoFaltaPreexistente, 'introducidaDesdeModuloTutores')) {
                alumnoSobreElQueVersaLaFalta.faltaIntroducidaPorElTutor = true;
              }
              if (_.has(elementoFaltaPreexistente, 'padresAvisadosPorSms')) {
                if (elementoFaltaPreexistente.padresAvisadosPorSms) {
                  alumnoSobreElQueVersaLaFalta.padresAvisadosPorSms = true;
                }
              }
              else {
                alumnoSobreElQueVersaLaFalta.padresAvisadosPorSms = false;
              }
              if (elementoFaltaPreexistente.retraso == 1) {
                alumnoSobreElQueVersaLaFalta.llegoConRetraso = true;
              }

            }
            else {
              console.warn("No he encontrado el alumno del que habla la falta preexistente. ¿Tal vez se dio de baja?")
            }

            vueApp.faltasPreexistentesGrupoSeleccionado[elementoFaltaPreexistente.matricula] = elementoFaltaPreexistente;
            console.log(vueApp.faltasPreexistentesGrupoSeleccionado[doc.data().matricula]);
          });

          vueApp.cargadasFaltasPreexitentes = true;
          vueApp.cargandoAlumnoSesionSeleccionada = false;
        })
        .catch(function (error) {
          console.log("Error recuperando faltas preexistentes: ", error);
        });
    },


    obtenerClaseCssAlumno(alumno) {
      if (vueApp.obtenerAlumnoEnPantallaPorMatricula(alumno.matricula).eseAlumnoFalto) {
        if (vueApp.obtenerAlumnoEnPantallaPorMatricula(alumno.matricula).laFaltaDelAlumnoEstaJustificada) {
          return "row zona-alumno alert alert-success";
        }
        else {
          return "row zona-alumno alert alert-danger";
        }
      }
      else if (vueApp.obtenerAlumnoEnPantallaPorMatricula(alumno.matricula).llegoConRetraso) {
        return "row zona-alumno alert alert-info";
      }
      else {
        return "row zona-alumno zona-alumno-sin-nada";
      }
    },


    obtenerAlumnoEnPantallaPorMatricula(matricula) {
      var aDevolver = null;
      var i = 0;
      while (i < vueApp.alumnosDelGrupoEnPantalla.length && aDevolver === null) {
        if (vueApp.alumnosDelGrupoEnPantalla[i].matricula == matricula) {
          aDevolver = vueApp.alumnosDelGrupoEnPantalla[i];
        }
        i++;
      }
      return aDevolver;
    },


    imagenAvatarError(e) {
      e.target.src = "https://cdn.glitch.com/245e020d-9485-4a19-a040-0306e5e43fb0%2Favatar.jpg?v=1580142827987";
    },


    ponerFalta(alumno, hayQueEnviarSMS) {

      console.log("Poniendo falta...");

      alumno.poniendoFalta = true;

      var anoSelec = vueApp.fechaSeleccionada.substring(0, 4);
      var mesSelec = vueApp.fechaSeleccionada.substring(5, 7);
      var diaSelec = vueApp.fechaSeleccionada.substring(8, 10);

      var today = new Date();
      var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
      var time = ((today.getHours() < 10 ? '0' : '') + today.getHours()) + ":" + ((today.getMinutes() < 10 ? '0' : '') + today.getMinutes()) + ":" + ((today.getSeconds() < 10 ? '0' : '') + today.getSeconds());
      var dateTime = date + ' ' + time;

      // Se modifica el documento (o se crea si ya existiera) tanto en la base de datos como en local...
      var objetoFalta = {};
      objetoFalta.ano = Number(anoSelec);
      objetoFalta.mes = Number(mesSelec);
      objetoFalta.dia = Number(diaSelec);
      objetoFalta.materia = vueApp.materiaSeleccionada;
      objetoFalta.matricula = Number(alumno.matricula);
      objetoFalta.profesor = vueApp.usuarioAutenticado.id;
      objetoFalta.sesion = vueApp.sesionSeleccionada;
      objetoFalta.faltas = 1;

      var idObjetoFalta = "M" + alumno.matricula + "-D" + anoSelec + "-" + mesSelec + "-" + diaSelec + "-S" + vueApp.sesionSeleccionada;

      vueApp.dbSecundaria.collection("faltas").doc(idObjetoFalta).set(objetoFalta, { merge: true })
        .then(function () {
          console.log("Falta grabada correctamente en la coleccion 'faltas' con id de documento " + idObjetoFalta);
          if (vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula] === undefined) {
            vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula] = objetoFalta;
          }
          else {
            vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].faltas = 1;
          }
          vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].id = idObjetoFalta;
          alumno.eseAlumnoFalto = true;

          if (hayQueEnviarSMS) {
            vueApp.enviarSmsAPadres(alumno, vueApp.fechaSeleccionada, vueApp.sesionSeleccionada, vueApp.materiaSeleccionada, vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula]);
          }
          else {
            alumno.poniendoFalta = false;
          }

        })
        .catch(function (error) {
          // TODO: que este error salga mas bonito
          alert("Error: la falta introducida no ha podido ser almacenada. Inténtalo otra vez y si el problema persiste, ponte en contacto con Jefatura de Estudios." + error);
          alumno.poniendoFalta = false;
        });


      // Se graba un documento de log de la accion
      var nuevoElementoDeLog = vueApp.dbSecundaria.collection("log").doc();
      nuevoElementoDeLog.set({
        "info": dateTime + ': el profesor ' + vueApp.usuarioAutenticado.id + ' ha indicado que el alumno ' + alumno.matricula + ' ha tenido falta el día ' +
          anoSelec + '/' + mesSelec + '/' + diaSelec + ' en la materia ' + vueApp.materiaSeleccionada + ' en la sesion ' + vueApp.sesionSeleccionada
      })


    },


    quitarFalta(alumno) {

      alumno.quitandoFalta = true;

      var anoSelec = vueApp.fechaSeleccionada.substring(0, 4);
      var mesSelec = vueApp.fechaSeleccionada.substring(5, 7);
      var diaSelec = vueApp.fechaSeleccionada.substring(8, 10);

      var idDocASobreescribir = vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].id;

      console.log("Sobreescribiendo la falta con ID " + idDocASobreescribir);

      var documentoASobreescribir = vueApp.dbSecundaria.collection("faltas").doc(idDocASobreescribir);

      documentoASobreescribir.update({
          "faltas": 0
        })
        .then(function () {
          console.log("Falta eliminada!");

          alumno.eseAlumnoFalto = false;
          alumno.quitandoFalta = false;
          vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].faltas = 0;

        })
        .catch(function (error) {
          alert("Error: la falta introducida no ha podido ser actualizada. Inténtalo otra vez y si el problema persiste, ponte en contacto con Jefatura de Estudios." + error);
          alumno.quitandoFalta = false;
        });


      var today = new Date();
      var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
      var time = ((today.getHours() < 10 ? '0' : '') + today.getHours()) + ":" + ((today.getMinutes() < 10 ? '0' : '') + today.getMinutes()) + ":" + ((today.getSeconds() < 10 ? '0' : '') + today.getSeconds());
      var dateTime = date + ' ' + time;

      // Se graba un documento de log de la accion
      var nuevoElementoDeLog = vueApp.dbSecundaria.collection("log").doc();
      nuevoElementoDeLog.set({
        "info": dateTime + ': el profesor ' + vueApp.usuarioAutenticado.id + ' ha indicado que el alumno ' + alumno.matricula + ' no ha faltado el día ' +
          anoSelec + '/' + mesSelec + '/' + diaSelec + ' en la materia ' + vueApp.materiaSeleccionada + ' en la sesion ' + vueApp.sesionSeleccionada
      })

    },


    ponerRetraso(alumno) {
      alumno.poniendoRetraso = true;

      var anoSelec = vueApp.fechaSeleccionada.substring(0, 4);
      var mesSelec = vueApp.fechaSeleccionada.substring(5, 7);
      var diaSelec = vueApp.fechaSeleccionada.substring(8, 10);

      var today = new Date();
      var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
      var time = ((today.getHours() < 10 ? '0' : '') + today.getHours()) + ":" + ((today.getMinutes() < 10 ? '0' : '') + today.getMinutes()) + ":" + ((today.getSeconds() < 10 ? '0' : '') + today.getSeconds());
      var dateTime = date + ' ' + time;

      // Se actualiza el documento adecuado en la base de datos..
      var idObjetoFalta = "M" + alumno.matricula + "-D" + anoSelec + "-" + mesSelec + "-" + diaSelec + "-S" + vueApp.sesionSeleccionada;

      var objetoFalta = {};
      objetoFalta.ano = Number(anoSelec);
      objetoFalta.mes = Number(mesSelec);
      objetoFalta.dia = Number(diaSelec);
      objetoFalta.materia = vueApp.materiaSeleccionada;
      objetoFalta.matricula = Number(alumno.matricula);
      objetoFalta.profesor = vueApp.usuarioAutenticado.id;
      objetoFalta.sesion = vueApp.sesionSeleccionada;
      objetoFalta.retraso = 1;

      vueApp.dbSecundaria.collection("faltas").doc(idObjetoFalta).set(objetoFalta, { merge: true })
        .then(function () {
          console.log("Retraso guardado correctamente en la coleccion 'faltas' con id de documento " + idObjetoFalta);
          if (vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula] === undefined) {
            vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula] = objetoFalta;
          }
          else {
            vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].retraso = 1;
          }
          alumno.llegoConRetraso = true;
          alumno.poniendoRetraso = false;
        })
        .catch(function (error) {
          console.error("Error escribiendo el retraso: ", error);
        });


    // TODO: faltaria grabar log de la accion del profesor     
    },


    quitarRetraso(alumno) {
      alumno.quitandoRetraso = true;

      var anoSelec = vueApp.fechaSeleccionada.substring(0, 4);
      var mesSelec = vueApp.fechaSeleccionada.substring(5, 7);
      var diaSelec = vueApp.fechaSeleccionada.substring(8, 10);

      var today = new Date();
      var date = today.getFullYear() + '-' + ("0" + (today.getMonth() + 1)).slice(-2) + '-' + ("0" + today.getDate()).slice(-2);
      var time = ((today.getHours() < 10 ? '0' : '') + today.getHours()) + ":" + ((today.getMinutes() < 10 ? '0' : '') + today.getMinutes()) + ":" + ((today.getSeconds() < 10 ? '0' : '') + today.getSeconds());
      var dateTime = date + ' ' + time;

      // Se actualiza el documento adecuado en la base de datos..
      var idObjetoFalta = "M" + alumno.matricula + "-D" + anoSelec + "-" + mesSelec + "-" + diaSelec + "-S" + vueApp.sesionSeleccionada;

      var objetoFalta = {};
      objetoFalta.retraso = 0;

      vueApp.dbSecundaria.collection("faltas").doc(idObjetoFalta).set(objetoFalta, { merge: true })
        .then(function () {
          console.log("Retraso actualizado correctamente en la coleccion 'faltas' con id de documento " + idObjetoFalta);
          vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].retraso = 1;
          alumno.llegoConRetraso = false;
          alumno.quitandoRetraso = false;
        })
        .catch(function (error) {
          console.error("Error escribiendo el retraso: ", error);
        });


    // TODO: faltaria grabar log de la accion del profesor     
    },


    convertirRetrasoEnFalta(alumno) {
      alumno.convirtiendoRetrasoEnFalta = true;

      var anoSelec = vueApp.fechaSeleccionada.substring(0, 4);
      var mesSelec = vueApp.fechaSeleccionada.substring(5, 7);
      var diaSelec = vueApp.fechaSeleccionada.substring(8, 10);

      // Se actualiza el documento adecuado en la base de datos..
      var idObjetoFalta = "M" + alumno.matricula + "-D" + anoSelec + "-" + mesSelec + "-" + diaSelec + "-S" + vueApp.sesionSeleccionada;

      var objetoFalta = {};
      objetoFalta.retraso = 0;
      objetoFalta.faltas = 1;

      vueApp.dbSecundaria.collection("faltas").doc(idObjetoFalta).set(objetoFalta, { merge: true })
        .then(function () {
          console.log("Retraso convertido correctamente en la coleccion 'faltas' con id de documento " + idObjetoFalta);
          vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].retraso = 0;
          vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].faltas = 1;
          alumno.llegoConRetraso = false;
          alumno.eseAlumnoFalto = true;
          alumno.convirtiendoRetrasoEnFalta = false;
        })
        .catch(function (error) {
          console.error("Error convirtiendo el retraso en falta: ", error);
        });
    },


    convertirFaltaEnRetraso(alumno) {
      alumno.convirtiendoFaltaEnRetraso = true;

      var anoSelec = vueApp.fechaSeleccionada.substring(0, 4);
      var mesSelec = vueApp.fechaSeleccionada.substring(5, 7);
      var diaSelec = vueApp.fechaSeleccionada.substring(8, 10);

      // Se actualiza el documento adecuado en la base de datos..
      var idObjetoFalta = "M" + alumno.matricula + "-D" + anoSelec + "-" + mesSelec + "-" + diaSelec + "-S" + vueApp.sesionSeleccionada;

      var objetoFalta = {};
      objetoFalta.retraso = 1;
      objetoFalta.faltas = 0;

      vueApp.dbSecundaria.collection("faltas").doc(idObjetoFalta).set(objetoFalta, { merge: true })
        .then(function () {
          console.log("Falta convertida correctamente en la coleccion 'faltas' con id de documento " + idObjetoFalta);
          vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].retraso = 1;
          vueApp.faltasPreexistentesGrupoSeleccionado[alumno.matricula].faltas = 0;
          alumno.llegoConRetraso = true;
          alumno.eseAlumnoFalto = false;
          alumno.convirtiendoFaltaEnRetraso = false;
        })
        .catch(function (error) {
          console.error("Error convirtiendo la falta en retraso: ", error);
        });
    },


    cargarDatosAlumnosRecursivamente() {

      console.log("Quedan por cargar los datos de " + vueApp.arrayTemporalAlumnosParaCargarDatos.length + " alumnos!");

      if (vueApp.arrayTemporalAlumnosParaCargarDatos.length > 0) {

        var alumnoActual = vueApp.arrayTemporalAlumnosParaCargarDatos.shift();

        var procesoActual = "cargar los datos del alumno seleccionado";
        console.log("Iniciando el proceso de " + procesoActual);

        var referencia = this.dbTablasComunes.collection("alumnos");

        referencia.where("matricula", "==", alumnoActual.matricula).get().then(function (querySnapshot) {
          console.log("Recibidos los datos necesarios para " + procesoActual);
          querySnapshot.forEach(function (doc) {

            var elementoDatosAlumno = doc.data();
            var elementoAlumno = vueApp.obtenerAlumnoEnPantallaPorMatricula(alumnoActual.matricula);

            elementoAlumno.datos = elementoDatosAlumno;
            elementoAlumno.datos.fechaRealNacimiento = moment(elementoDatosAlumno.fechaNacimiento).format("DD/MM/YYYY");
            elementoAlumno.datos.edad = moment().diff(elementoAlumno.datos.fechaNacimiento, 'years');
            elementoAlumno.datos.registrosParaEnvioDeSMS = [];

            if (elementoAlumno.datos.movilMadre.charAt(0) == "$") {
              elementoAlumno.datos.movilMadre = elementoAlumno.datos.movilMadre.substring(1);
            }
            if (elementoAlumno.datos.movilPadre.charAt(0) == "$") {
              elementoAlumno.datos.movilPadre = elementoAlumno.datos.movilPadre.substring(1);
            }

            console.log("Cargados datos personales de un alumno");
            vueApp.cargarDatosAlumnosRecursivamente();
          });
        }).catch(function (error) {
          console.log("Error: se produjo un error al " + procesoActual, error);
        });


      }
      else {
        vueApp.cargadosTodosLosDatosDeLosAlumnosEnPantalla = true;
        console.log("Se han terminado de cargar todos los datos personales de los alumnos!!")
        vueApp.$forceUpdate();
      }

    },




    enviarSmsAPadres(alumno, fecha, sesion, materia, faltaPreexistente) {

      alert("Funcion no disponible en lab");

    },




    sinAcentos(texto) {
      var cadena = texto;
      cadena = cadena.replace(/á/g, "a");
      cadena = cadena.replace(/é/g, "e");
      cadena = cadena.replace(/í/g, "i");
      cadena = cadena.replace(/ó/g, "o");
      cadena = cadena.replace(/ú/g, "u");
      cadena = cadena.replace(/ñ/g, "n");
      cadena = cadena.replace(/Á/g, "A");
      cadena = cadena.replace(/É/g, "E");
      cadena = cadena.replace(/Í/g, "I");
      cadena = cadena.replace(/Ó/g, "O");
      cadena = cadena.replace(/Ú/g, "U");
      cadena = cadena.replace(/Ñ/g, "N");
      return cadena;
    }


  }
})
