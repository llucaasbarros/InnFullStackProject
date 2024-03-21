$(document).ready(function () {
    getToken();
    $("#loginForm").submit(function (event) {
      event.preventDefault();
  
      var cpf = $("#cpfInput").val();
      var password = $("#passwordInput").val();
  
      axios
        .post("http://localhost:3000/login", {
          cpf: cpf,
          senha: password,
        })
        .then(function (response) {
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  
    $("#signupForm").submit(function (event) {
      event.preventDefault();
  
      var name = $("#nameInput").val();
      var cpf = $("#cpfInputSignup").val();
      var birthDate = $("#birthdateInput").val();
      var address = $("#addressInput").val();
      var name = $("#nameInput").val();
      var password = $("#passwordInputSignup").val();
      var email = $("#emailInputSignup").val();
      axios
        .post("http://localhost:3000/cadastro", {
          cpf: cpf,
          nome: name,
          CPF: cpf,
          DataNascimento: birthDate,
          Endereco: address,
          email,
          senha: password,
        })
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  
    $("#bookingForm").submit(async function (event) {
      getToken();
      event.preventDefault();
      var checkingDate = $("#checkInDate").val();
      var checkOutDate = $("#checkOutDate").val();
      var roomType = $("#roomType").val();
      var numberOfPeople = $("#numberOfPeople").val();
  
      let roomDetails = await axios.post("http://localhost:3000/quarto", {
        Tipo: roomType,
        Descricao: generateRandomText(),
        Preco: generateRandomPrice(100.0, 2000.0, 2),
      });
  
      let bookingDetails = axios
        .post("http://localhost:3000/reserva", {
          id_quarto: roomDetails.data.id_quarto,
          DataEntrada: moment(checkingDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
          DataSaida: moment(checkOutDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
          NumeroPessoas: parseInt(numberOfPeople),
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
      $("#reservationModal").modal("hide");
      alert("Reserva feita com sucesso");
    });
  
    $("#showBookings").on("click", async function (event) {
      getToken();
      $("#reservas-table").empty();
      axios
        .get("http://localhost:3000/reserva")
        .then((response) => {
          response.data.forEach((reserva) => {
            var linha =
              "<tr>" +
              "<td>" +
              reserva.id_reserva +
              "</td>" +
              "<td>" +
              reserva.id_quarto +
              "</td>" +
              "<td>" +
              reserva.DataEntrada +
              "</td>" +
              "<td>" +
              reserva.DataSaida +
              "</td>" +
              "<td>" +
              reserva.NumeroPessoas +
              "</td>" +
              "<td>" +
              `<button class='btn btn-primary btn-editar-reserva' data-reserva-id=${reserva.id_reserva}>Editar</button>` +
              "</td>" +
              "<td>" +
              `<button class='btn btn-danger btn-excluir-reserva' data-reserva-id=${reserva.id_reserva}>Excluir</button>` +
              "</td>" +
              "</tr>";
            $("#reservas-table").append(linha);
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  
    $(document).on("click", ".btn-excluir-reserva", async function (event) {
      getToken();
      let reservaId = $(this).data("reserva-id");
      axios
        .delete("http://localhost:3000/reserva/" + reservaId)
        .then((response) => {
          $(this).closest("tr").remove();
          alert("Reserva excluída com sucesso");
        })
        .catch((e) => {
          alert("Ocorreu um erro...");
        });
    });
  
    $(document).on("click", ".btn-editar-reserva", async function (event) {
      getToken();
      let reservaId = $(this).data("reserva-id");
      const reservaDados = (
        await axios.get("http://localhost:3000/reserva/" + reservaId)
      ).data[0];
      const quartoDados = (
        await axios.get("http://localhost:3000/quarto/" + reservaDados?.id_quarto)
      ).data[0];
      $("#reservationEditModal").modal("show");
      $("#userBookings").modal("hide");
      $("#checkInDateEdit").val(
        moment(reservaDados.DataEntrada).format("DD/MM/YYYY")
      );
      $("#checkOutDateEdit").val(
        moment(reservaDados.DataSaida).format("DD/MM/YYYY")
      );
      $("#roomTypeEdit").val(quartoDados.Tipo);
      $("#numberOfPeopleEdit").val(reservaDados.NumeroPessoas);
      $("#id-reserva-selecionada").data("id", reservaId);
      $("#id-reserva-selecionada").data("id-quarto", reservaDados?.id_quarto);
    });
  
    $(document).on("click", "#bookingFormEdit", async function (event) {
      getToken();
      let reservaId = $("#id-reserva-selecionada").data("id");
      let quartoId = $("#id-reserva-selecionada").data("id-quarto");
      let reservaDados = (
        await axios.put("http://localhost:3000/reserva/" + reservaId, {
          DataEntrada: moment($("#checkInDateEdit").val(), "DD/MM/YYYY").format(
            "YYYY-MM-DD"
          ),
          DataSaida: moment($("#checkOutDateEdit").val(), "DD/MM/YYYY").format(
            "YYYY-MM-DD"
          ),
          NumeroPessoas: parseInt($("#numberOfPeopleEdit").val()),
        })
      ).data[0];
  
      await axios.put("http://localhost:3000/quarto/" + quartoId, {
        Tipo: $("#roomTypeEdit").val(),
      });
      $("#reservationEditModal").modal("hide");
      alert("Reserva editada com sucesso");
    });
  });
  
  function generateRandomText(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";
    let randomText = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomText += characters.charAt(randomIndex);
    }
  
    return randomText;
  }
  
  // Generate a random price (floating-point number)
  function generateRandomPrice(min, max, decimalPlaces) {
    const randomPrice = Math.random() * (max - min) + min;
    return parseFloat(randomPrice.toFixed(decimalPlaces));
  }
  
  function getToken() {
    if (localStorage.getItem("token")) {
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + localStorage.getItem("token");
    }
  }