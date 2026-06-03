let contas = [];
let editandoIndex = -1;
window.onload = function () {
  const dados = localStorage.getItem("contas");
  if (dados) {
    contas = JSON.parse(dados);
  }
  render();
};

function salvar() {
  localStorage.setItem("contas", JSON.stringify(contas));
}

function adicionarConta() {

  const nome =
    document.getElementById("nome").value;

  const valor =
    parseFloat(document.getElementById("valor").value);

  const data =
    document.getElementById("data").value;

  if (!nome || !valor || !data) return;

  if (editandoIndex >= 0) {

    contas[editandoIndex].nome = nome;
    contas[editandoIndex].valor = valor;
    contas[editandoIndex].data = data;

    editandoIndex = -1;

    document.getElementById("btnSalvar").innerText =
      "Adicionar";

  } else {

    contas.push({
      nome,
      valor,
      data,
      pago: false
    });

  }

  salvar();
  render();

  document.getElementById("nome").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("data").value = "";
}

function marcarPago(index) {
  contas[index].pago = !contas[index].pago;
  salvar();
  render();
}

function excluirConta(index) {
  contas.splice(index, 1);
  salvar();
  render();
}

// pega chave de ordenação correta
function getMesKey(data) {
  const d = new Date(data);
  return d.getFullYear() * 100 + (d.getMonth() + 1);
}

function getMesLabel(data) {

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];

  const d = new Date(data);

  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}
function render() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let grupos = {};

  contas.forEach((c, index) => {
    const d = new Date(c.data);
    const key = d.getFullYear() * 100 + (d.getMonth() + 1);

    if (!grupos[key]) {
     grupos[key] = {
  label: getMesLabel(c.data),
  items: []
};
    }

    // 🔥 IMPORTANTE: manter index real aqui
    grupos[key].items.push({ ...c, index });
  });

  const ordenados = Object.keys(grupos).sort((a, b) => a - b);

  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(0,0,0,0);

  ordenados.forEach(key => {
    const mes = grupos[key];

    const coluna = document.createElement("div");
    coluna.className = "mes";

    coluna.innerHTML = `<h2>📅 ${mes.label}</h2>`;

    mes.items.forEach(c => {
      const dataConta = new Date(c.data);
      dataConta.setHours(0,0,0,0);

      let aviso = "";

      if (dataConta.getTime() === hoje.getTime()) {
        aviso = "⚠️ VENCE HOJE";
      } else if (dataConta.getTime() === amanha.getTime()) {
        aviso = "⚠️ VENCE AMANHÃ";
      }

      coluna.innerHTML += `
        <div class="card" style="
          border-left: 6px solid ${c.pago ? 'green' : 'red'};
          background: ${aviso ? '#fff3cd' : 'white'};
        ">
         <b style="font-size:18px;">
${c.nome}
</b><br>

💰 R$ ${Number(c.valor).toFixed(2)}<br>

📅 ${c.data}<br>

${c.pago
 ? "🟢 Pago"
 : "🔴 Pendente"}
<br>

          <b style="color:#d32f2f;">${aviso}</b><br>

          <button onclick="marcarPago(${c.index})">
            ${c.pago ? "Pago ✔" : "Pagar"}
          </button>

          <button onclick="excluirConta(${c.index})"
            style="background:red; margin-top:5px;">
            Excluir
          </button>
        </div>
      `;
    });

    lista.appendChild(coluna);
    atualizarDashboard();
  });
}
function atualizarDashboard() {

  let total = 0;
  let pagas = 0;
  let pendentes = 0;
  let vencemHoje = 0;
  let vencemAmanha = 0;

  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(0,0,0,0);

  contas.forEach(c => {

    total += Number(c.valor);

    if (c.pago) {
      pagas++;
    } else {
      pendentes++;
    }

    const dataConta = new Date(c.data);
    dataConta.setHours(0,0,0,0);

    if (dataConta.getTime() === hoje.getTime()) {
      vencemHoje++;
    }

    if (dataConta.getTime() === amanha.getTime()) {
      vencemAmanha++;
    }
  });

  document.getElementById("dashboard").innerHTML = `
    <p><b>💰 Total Geral:</b> R$ ${total.toFixed(2)}</p>
    <p><b>🔴 Pendentes:</b> ${pendentes}</p>
    <p><b>🟢 Pagas:</b> ${pagas}</p>
    <p><b>⚠️ Vencem Hoje:</b> ${vencemHoje}</p>
    <p><b>⚠️ Vencem Amanhã:</b> ${vencemAmanha}</p>
  `;
}

function editarConta(index) {

  editandoIndex = index;

  document.getElementById("nome").value =
    contas[index].nome;

  document.getElementById("valor").value =
    contas[index].valor;

  document.getElementById("data").value =
    contas[index].data;

  document.getElementById("btnSalvar").innerText =
    "Salvar Alterações";
}

function exportarBackup() {

  const dados = JSON.stringify(contas, null, 2);

  const blob = new Blob(
    [dados],
    { type: "application/json" }
  );

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "contas-da-mamis-backup.json";

  link.click();
}

function importarBackup(event) {

  const arquivo = event.target.files[0];

  if (!arquivo) return;

  const leitor = new FileReader();

  leitor.onload = function(e) {

    try {

      contas = JSON.parse(e.target.result);

      salvar();
      render();

      alert("Backup restaurado com sucesso!");

    } catch {

      alert("Arquivo inválido.");
    }
  };

  leitor.readAsText(arquivo);
}
