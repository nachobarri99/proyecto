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

    grupoSeleccionado: null,
    listadoGrupos: [],
    alumnoSeleccionado: null,
    datosAlumnoSeleccionado: null,
    datosHorarioGrupoSeleccionado: [],
    datosMateriasAlumnoSeleccionado: [],

    appFirebaseTablasComunes: null,
    appFirebaseSecundaria: null,
    dbTablasComunes: null,
    dbSecundaria: null,

    listadoAlumnos: [],
    todosLosAlumnos: [],
    listadoOrdenado:[],
    listadoFaltasAlumnosSeleccionado: [],
    faltasDelAlumnoCargadas: false,

    estadosFalta: ["No justif.", "Justificada", ""],
    nombreCortoDeDia: ["L", "M", "X", "J", "V"],
    nombreCortoSesion: ["1", "2", "3", "4", "5", "6"],

    elUsuarioPuedeModificar: false,
    documentosRecibidosTablasComunesV2: 0,
    documentosRecibidosAsistenciaV2: 0,

    today: moment(),
    dateContext: moment(),
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "S", "D"],

    verAlumnosYaNoEstan: false,

    permisosUsuario: []
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
    /*
    ordenar: function() {
      function compare(a, b) {
        if (a.nombreCompleto < b.nombreCompleto)
          return -1;
        if (a.nombreCompleto > b.nombreCompleto)
          return 1;
        return 0;
      }

      return this.listadoAlumnos.sort(compare);
    },
    */

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
      this.cargarListadoAlumnosDeUnGrupo();
      this.cargarHorariosGrupoSeleccionado();
    },

    alumnoSeleccionado: function(val, oldVal) {
      vueApp.faltasDelAlumnoCargadas = false;
      this.cargarFaltasAlumno();
      this.cargarDatosAlumnoSeleccionado();
      this.cargarMateriasAlumnoSeleccionado();
    }
  },

  mounted: function() {
    console.log("Vue iniciado");

    window.vueApp = this;

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

    toastr.options = {
      closeButton: true,
      timeOut: 300000,
      extendedTimeOut: 300000,
      positionClass: "toast-top-center"
    };

    console.log("Aplicación VueJS montada!");

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

      vueApp.usuarioAutenticado = usuarioAutenticado;
      vueApp.nombreDeUsuario =
        "Hola de nuevo, " +
        vueApp.usuarioAutenticado.nombre +
        " (" +
        vueApp.usuarioAutenticado.id +
        ")!";
      vueApp.cargaLoNecesarioAntesDeEmpezar();
    },

    cargaLoNecesarioAntesDeEmpezar() {
      vueApp.cargarListadoGrupos();
      vueApp.cargarTodosLosAlumnos();
      vueApp.comprobarSiElUsuarioPuedeModificar();
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
        })
        .catch(function(error) {
          console.log("Error: se produjo un error al " + procesoActual, error);
        });
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
              alumnoActual.nombreCompleto + " - " + elemento.matricula;
            vueApp.listadoAlumnos.push(elemento);
            
          });
          vueApp.listadoAlumnos.sort((unAlumno, otroAlumno) => unAlumno.nombreCompleto - otroAlumno.nombreCompleto);
        })
        .catch(function(error) {
          console.log("Error obteniendo los alumnos:", error);
        });
    },

  

    cargarFaltasAlumno() {
      vueApp.listadoFaltasAlumnosSeleccionado = [];

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
            if (elemento.faltas == 1) {
              elemento.estado = vueApp.estadosFalta[0]; // No justificada
              if (typeof elemento.justificadas !== "undefined") {
                if (elemento.justificadas == 1) {
                  elemento.estado = vueApp.estadosFalta[1]; // Justificada
                }
              } else {
              }
            } else if (elemento.faltas == 0) {
              elemento.estado = vueApp.estadosFalta[2]; // Sin falta
            }
            vueApp.listadoFaltasAlumnosSeleccionado.push(elemento);
            console.log("Falta recibida con id " + elemento.id);
            console.log(elemento);
          });
          vueApp.faltasDelAlumnoCargadas = true;
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

    /*
     * Estados posibles de las faltas:
     * - Faltas: 0 / Justifciadas: 0     -> Sin falta
     * - Faltas: 1 / Justificadas: 0     -> Falta no justificada
     * - Faltas: 1 / Justificadas: 1     -> Falta justificada
     * - Faltas: 0 / Justificadas: 1     -> No debería haber ningún registro así
     */
    cambiarEstadoFalta(dia, sesion) {
      if (vueApp.permisosUsuario[vueApp.grupoSeleccionado].includes("w")) {
        var today = new Date();
        var date =
          today.getFullYear() +
          "-" +
          ("0" + (today.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + today.getDate()).slice(-2);
        var time =
          (today.getHours() < 10 ? "0" : "") +
          today.getHours() +
          ":" +
          ((today.getMinutes() < 10 ? "0" : "") + today.getMinutes()) +
          ":" +
          ((today.getSeconds() < 10 ? "0" : "") + today.getSeconds());
        var dateTime = date + " " + time;

        // Comprobamos si existía una falta previa para esa hora metida por algún profesor...
        if (!_.has(sesion.falta, "faltas")) {
          if (!sesion.falta.estadoPendienteDeCambio) {
            sesion.falta.estadoPendienteDeCambio = true;
            vueApp.$forceUpdate();

            console.log("Voy a lanzar ejecución diferida...");

            // No hay falta previa en la base de datos
            console.log(
              "El usuario está intentando cambiar una falta que no existía previamente en la base de datos!"
            );

            var objetoFalta = {};
            objetoFalta.ano = Number(vueApp.anoCalendario);
            objetoFalta.mes = Number(vueApp.mesCalendario);
            objetoFalta.dia = Number(dia.numero);
            objetoFalta.materia = sesion.materia;
            objetoFalta.matricula = Number(
              vueApp.datosAlumnoSeleccionado.matricula
            );
            objetoFalta.profesor = "";
            objetoFalta.sesion = sesion.sesion.toString();
            objetoFalta.faltas = 1;
            objetoFalta.retrasos = 0;
            objetoFalta.justificadas = 0;
            objetoFalta.introducidaDesdeModuloTutores = true;

            var mesReal =
              objetoFalta.mes < 10 ? "0" + objetoFalta.mes : objetoFalta.mes;
            var diaReal =
              objetoFalta.dia < 10 ? "0" + objetoFalta.dia : objetoFalta.dia;
            var idObjetoFalta =
              "M" +
              objetoFalta.matricula +
              "-D" +
              objetoFalta.ano +
              "-" +
              mesReal +
              "-" +
              diaReal +
              "-S" +
              objetoFalta.sesion;

            console.log(objetoFalta);

            vueApp.dbSecundaria
              .collection("faltas")
              .doc(idObjetoFalta)
              .set(objetoFalta)
              .then(function() {
                console.log(
                  "Falta grabada correctamente en el siguiente documento:"
                );
                console.log(idObjetoFalta);

                objetoFalta.id = idObjetoFalta;
                objetoFalta.estadoPendienteDeCambio = false;
                objetoFalta.estado = vueApp.estadosFalta[0]; // No justificada

                vueApp.listadoFaltasAlumnosSeleccionado.push(objetoFalta);
              })
              .catch(function(error) {
                alert(
                  "Error: la falta introducida no ha podido ser almacenada. Inténtalo otra vez y si el problema persiste, ponte en contacto con Jefatura de Estudios." +
                    error
                );
              });
          }
        } else {
          console.log(
            "Voy a actualizar una falta previa de la base de datos..."
          );
          // Hay falta previa en la base de datos

          var referencia = this.dbSecundaria
            .collection("faltas")
            .doc(sesion.falta.id);

          sesion.falta.estadoPendienteDeCambio = true;

          //No justificada -> Pasa a justificada
          if (sesion.falta.estado == this.estadosFalta[0]) {
            referencia
              .update({
                faltas: 1,
                justificadas: 1
              })
              .then(function() {
                console.log(
                  "Falta actualizada correctamente! Ahora está justificada!"
                );
                sesion.falta.estado = vueApp.estadosFalta[1];
                sesion.falta.faltas = 1;
                sesion.falta.justificadas = 1;
                sesion.falta.estadoPendienteDeCambio = false;
                // Se graba un documento de log de la accion
                var nuevoElementoDeLog = vueApp.dbSecundaria
                  .collection("log")
                  .doc();
                nuevoElementoDeLog.set({
                  info:
                    dateTime +
                    ": el profesor " +
                    vueApp.usuarioAutenticado.id +
                    " ha justificado como tutor la falta del alumno con matricula " +
                    sesion.falta.matricula +
                    " del día " +
                    sesion.falta.ano +
                    "/" +
                    sesion.falta.mes +
                    "/" +
                    sesion.falta.dia +
                    " en la materia " +
                    sesion.falta.materiaSeleccionada +
                    " en la sesion " +
                    sesion.falta.sesion
                });
              })
              .catch(function(error) {
                console.error("Error actualizando la falta: ", error);
              });
          } else if (sesion.falta.estado == this.estadosFalta[1]) {
            //Justificada -> Pasa a sin falta

            referencia
              .update({
                faltas: 0,
                justificadas: 0
              })
              .then(function() {
                console.log(
                  "Falta actualizada correctamente! Ahora ya no hay falta!"
                );
                sesion.falta.estado = vueApp.estadosFalta[2];
                sesion.falta.faltas = 0;
                sesion.falta.justificadas = 0;
                sesion.falta.estadoPendienteDeCambio = false;
                // Se graba un documento de log de la accion
                var nuevoElementoDeLog = vueApp.dbSecundaria
                  .collection("log")
                  .doc();
                nuevoElementoDeLog.set({
                  info:
                    dateTime +
                    ": el profesor " +
                    vueApp.usuarioAutenticado.id +
                    " ha quitado como tutor la falta del alumno con matricula " +
                    sesion.falta.matricula +
                    " del día " +
                    sesion.falta.ano +
                    "/" +
                    sesion.falta.mes +
                    "/" +
                    sesion.falta.dia +
                    " en la materia " +
                    sesion.falta.materiaSeleccionada +
                    " en la sesion " +
                    sesion.falta.sesion
                });
              })
              .catch(function(error) {
                console.error("Error actualizando la falta: ", error);
              });
          } else if (sesion.falta.estado == this.estadosFalta[2]) {
            //Sin falta -> Pasa a no justificada

            referencia
              .update({
                faltas: 1,
                justificadas: 0
              })
              .then(function() {
                console.log(
                  "Falta actualizada correctamente! Ahora no esta justificada!"
                );
                sesion.falta.estado = vueApp.estadosFalta[0];
                sesion.falta.faltas = 1;
                sesion.falta.justificadas = 0;
                sesion.falta.estadoPendienteDeCambio = false;
                // Se graba un documento de log de la accion
                var nuevoElementoDeLog = vueApp.dbSecundaria
                  .collection("log")
                  .doc();
                nuevoElementoDeLog.set({
                  info:
                    dateTime +
                    ": el profesor " +
                    vueApp.usuarioAutenticado.id +
                    " ha marcado de nuevo como falta como tutor la falta del alumno con matricula " +
                    sesion.falta.matricula +
                    " del día " +
                    sesion.falta.ano +
                    "/" +
                    sesion.falta.mes +
                    "/" +
                    sesion.falta.dia +
                    " en la materia " +
                    sesion.falta.materiaSeleccionada +
                    " en la sesion " +
                    sesion.falta.sesion
                });
              })
              .catch(function(error) {
                console.error("Error actualizando la falta: ", error);
              });
          }
        }
      } else {
        toastr.warning(
          "Solo puedes justificar las faltas si eres tutor del grupo!"
        );
      }
    },

    datosCargados: function() {
      return this.alumnos != null && this.model.grupo !== "";
    }
  }
});
