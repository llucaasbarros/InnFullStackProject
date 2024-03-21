/*HOME*/
// aplicar imagem no header
document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".header");
    var imageUrl = "./public/img/4Vhvgs.jpg"; // Substitua pelo caminho exato da sua imagem
    header.style.background = `linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.5)), url(${imageUrl}) center/cover no-repeat`;
  });
  document.addEventListener("DOMContentLoaded", function () {
    // Seleciona todos os elementos que devem ter o efeito fade-in
    var fadeElements = document.querySelectorAll(".fade-in");
  
    // Função para adicionar a classe 'visible' a um elemento
    function reveal(element, delay) {
      setTimeout(() => {
        element.classList.add("visible");
      }, delay);
    }
  
    // Aplica a função a cada elemento com um atraso incremental
    fadeElements.forEach((element, index) => {
      reveal(element, index * 500);
    });
  });
  
  document.querySelector(".toggle-map").addEventListener("click", function () {
    var mapInfoContainer = document.querySelector(".map-info-container");
    mapInfoContainer.style.display =
      mapInfoContainer.style.display === "none" ? "block" : "none";
    this.textContent = this.textContent === "Leia Mais" ? "Voltar" : "Leia Mais";
  });
  
  // Limpa todos os campos do formulário de cadastro
  function clearForm() {
    document.getElementById("signupForm").reset();
  }
  
  function editForm() {
    document.getElementById("nameInput").focus();
  }
  
  function submitForm() {
    var formElement = document.getElementById("signupForm");
    console.log("Formulário enviado");
  }
  
  // Reservas a partir do dia seguinte
  $(document).ready(function () {
    $(".datepicker").datepicker({
      format: "dd/mm/yyyy",
      startDate: "+1d",
      autoclose: true,
    });
  
    // Garantir que a data de saída seja após a data de entrada
    $("#checkInDate").on("change", function () {
      var minDate = $("#checkInDate").datepicker("getDate");
      minDate.setDate(minDate.getDate() + 1); // Saída no mínimo um dia após a entrada
      $("#checkOutDate").datepicker("setStartDate", minDate);
    });
  
    $("#checkOutDate").on("change", function () {
      var maxDate = $("#checkOutDate").datepicker("getDate");
      $("#checkInDate").datepicker("setEndDate", maxDate);
    });
  });
  
  $(document).ready(function () {
    // Inicializa os DatePickers
    $("#reservationForm").on("submit", function (event) {
      event.preventDefault();
  
      // Captura informaçao
      var checkInDate = $("#checkInDate").val();
      var checkOutDate = $("#checkOutDate").val();
      var roomType = $("#roomType").find("option:selected").text();
      var numberOfPeople = $("#numberOfPeople").val();
  
      // Preenchimento das informa;oes do modal de reserva
      var reservationDetails =
        "Check-in: " +
        checkInDate +
        "<br>Check-out: " +
        checkOutDate +
        "<br>Tipo de quarto: " +
        roomType +
        "<br>Número de pessoas: " +
        numberOfPeople;
  
      // vai inserir os detalhes no parágrafo do modal de confirmação
      $("#reservationDetails").html(reservationDetails);
  
      // fechar o de reserva e abrir o de confirmaçao
      $("#reservationModal").modal("hide");
      $("#confirmationModal").modal("show");
    });
  });
  
  //fecha o modal de cadastro
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signupForm").addEventListener("submit", function () {
      $("#signupModal").modal("hide");
    });
  });
  
  //fecha modal de login
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("loginForm").addEventListener("submit", function () {
      $("#loginModal").modal("hide");
    });
  });
  
  // Adicionar evento ao botão 'Entrar' ocultar botao de cadastre-se e fechar
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("loginForm").addEventListener("submit", function () {
      document.querySelector(".btn-signup").style.display = "none";
      $("#loginModal").modal("hide");
    });
  });