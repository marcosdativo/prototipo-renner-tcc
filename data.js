/* Dados do protótipo. Avaliações, pedidos, pessoas e valores são FICTÍCIOS (protótipo acadêmico).
   Fotos de produto: CDN público da Lojas Renner. Fotos de "clientes": Unsplash (licença Unsplash). */
(function () {
  'use strict';

  const RENNER_IMG = (id, size, n) => `https://img.lojasrenner.com.br/item/${id}/${size}/${n}.jpg`;
  const UNSPLASH = (id, w, h) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=${w}${h ? `&h=${h}` : ''}`;

  /* ---------- Regras do programa (ajuste aqui) ---------- */
  const REGRAS = {
    reaisPorPonto: 0.10,          // 1 ponto = R$ 0,10  →  100 pontos = R$ 10,00
    maxPontos: 100,               // por produto avaliado
    prazoDevolucaoDias: 7,        // direito de arrependimento (Decreto 7.962/2013): cashback libera depois disso
    janelaAvaliacaoDias: 30,      // até quantos dias após a entrega dá para avaliar e ganhar pontos
    minCaracteresComentario: 30
  };

  // Campos do formulário e pontos de cada um (somam 100). A NOTA dá pontos por ser preenchida, nunca pelo valor.
  // O tamanho comprado já vem preenchido com o tamanho do pedido (a cliente avalia o tamanho que recebeu).
  const CAMPOS = [
    { k: 'nota',       label: 'Nota',                 pts: 5 },
    { k: 'comprado',   label: 'Tamanho comprado',     pts: 5 },
    { k: 'modelagem',  label: 'Modelagem',            pts: 10 },
    { k: 'tecido',     label: 'Tecido',               pts: 5 },
    { k: 'conforto',   label: 'Conforto',             pts: 5 },
    { k: 'altura',     label: 'Altura',               pts: 5 },
    { k: 'busto',      label: 'Busto',                pts: 5 },
    { k: 'cintura',    label: 'Cintura',              pts: 5 },
    { k: 'quadril',    label: 'Quadril',              pts: 5 },
    { k: 'fotos',      label: 'Fotos',                pts: 30 },
    { k: 'comentario', label: 'Comentário',           pts: 20 }
  ];

  /* ---------- Cliente logada (persona "recorrente": tem medidas salvas no Provador Virtual) ---------- */
  const CLIENTE = {
    nome: 'Juliana', sobrenome: 'Souza', email: 'ju.souza@email.com',
    medidas: { altura: 165, busto: 90, cintura: 72, quadril: 100 },
    endereco: ['Rua das Acácias, 120 – apto 34', 'Vila Mariana, São Paulo – SP', 'CEP 04110-000']
  };

  /* ---------- Produto principal ---------- */
  const PRODUTO = {
    id: 'blusa-justinha',
    nome: 'Blusa Básica Justinha em Ribana de Algodão',
    marca: 'Cortelle',
    preco: 79.90,
    parcelas: '2x de R$ 39,95*',
    categoria: ['Feminino', 'Blusas e Camisetas', 'Manga Curta'],
    tamanhos: ['PP', 'P', 'M', 'G', 'GG'],
    cores: [
      { nome: 'Off White',    hex: '#fdf4ed', codigo: '921046450', fotos: [3, 4, 5, 6, 7, 12, 13] },
      { nome: 'Preto',        hex: '#121318', codigo: '927869211', fotos: [3, 4, 5, 7] },
      { nome: 'Marrom',       hex: '#b08171', codigo: '921046417', fotos: [3, 4, 5, 6, 7] },
      { nome: 'Vermelho',     hex: '#D32725', codigo: '929588333', fotos: [3, 4, 5, 8, 13, 14] },
      { nome: 'Verde',        hex: '#203437', codigo: '930047500', fotos: [3, 4, 5, 6] },
      { nome: 'Marrom Café',  hex: '#321E1E', codigo: '930047569', fotos: [3, 4, 5, 6] },
      { nome: 'Cinza Escuro', hex: '#56575d', codigo: '930997484', fotos: [3, 4, 5, 6, 13, 14] },
      { nome: 'Bordô',        hex: '#4e2132', codigo: '930997556', fotos: [1, 2, 3, 4, 5, 7] }
    ],
    modelo: { altura: '1,80 m', busto: 79, cintura: 61, quadril: 89, veste: 'P/36' },
    composicao: '95% Algodão, 5% Elastano',
    // Tabela de medidas do corpo (cm), faixa [mín, máx]
    tabela: {
      PP: { busto: [78, 82],  cintura: [60, 64], quadril: [86, 90] },
      P:  { busto: [83, 89],  cintura: [65, 71], quadril: [91, 97] },
      M:  { busto: [90, 97],  cintura: [72, 79], quadril: [98, 105] },
      G:  { busto: [98, 106], cintura: [80, 88], quadril: [106, 114] },
      GG: { busto: [107, 116], cintura: [89, 98], quadril: [115, 124] }
    },
    notaLoja: 4.8 // nota da LOJA (entrega/atendimento) – exibida separada da nota da peça
  };

  /* ---------- Vitrine (outros produtos são ilustrativos) ---------- */
  const VITRINE = [
    { id: 'blusa-justinha', nome: PRODUTO.nome, marca: 'Cortelle', preco: 79.90, img: RENNER_IMG('921046450', 'medium', 3), flag: 'Mais vendida' },
    { id: 'regata-ribana', nome: 'Regata Básica em Ribana com Alças Largas', marca: 'Marfinno', preco: 69.90, img: RENNER_IMG('931495654', 'medium', 3) },
    { id: 'blusa-poliamida', nome: 'Blusa Básica em Poliamida com Alças Finas', marca: 'Cortelle', preco: 49.90, img: RENNER_IMG('858648641', 'medium', 3) },
    { id: 'cropped-canelada', nome: 'Blusa Cropped sem Manga em Algodão com Textura Canelada', marca: 'Blue Steel', de: 79.90, preco: 59.90, img: RENNER_IMG('931289711', 'medium', 1) },
    { id: 'regata-decote-u', nome: 'Blusa Regata em Ribana com Decote U', marca: 'Marfinno', preco: 59.90, img: RENNER_IMG('930669704', 'medium', 1) },
    { id: 'regata-halter', nome: 'Blusa Regata com Gola Halter em Poliamida', marca: 'Cortelle', de: 89.90, preco: 69.90, img: RENNER_IMG('931034567', 'medium', 3) },
    { id: 'regata-decote-v', nome: 'Blusa Regata em Ribana com Alça Larga e Decote V', marca: 'Cortelle', preco: 69.90, img: RENNER_IMG('931256194', 'medium', 3) },
    { id: 'trico-canelada', nome: 'Blusa Estruturada em Tricô com Textura Canelada', marca: 'Cortelle', de: 159.90, preco: 129.90, img: RENNER_IMG('930543440', 'medium', 3) }
  ];

  const CATEGORIAS = [
    { nome: 'Blusas', img: RENNER_IMG('921046450', 'medium', 3), href: '#/blusas' },
    { nome: 'Regatas', img: RENNER_IMG('931495654', 'medium', 3), href: '#/blusas' },
    { nome: 'Vestidos', img: RENNER_IMG('930897352', 'medium', 3) },
    { nome: 'Tricô', img: RENNER_IMG('930543440', 'medium', 3) },
    { nome: 'Novidades', img: RENNER_IMG('930958611', 'medium', 3) }
  ];

  const MENU_CARDS = [
    { nome: 'Ofertas', img: RENNER_IMG('929731355', 'medium', 3) },
    { nome: 'Novidades', img: RENNER_IMG('930958611', 'medium', 3) },
    { nome: 'Feminino', img: RENNER_IMG('921046417', 'medium', 3), href: '#/blusas' },
    { nome: 'Blusas', img: RENNER_IMG('927869211', 'medium', 3), href: '#/blusas' },
    { nome: 'Vestidos', img: RENNER_IMG('930897352', 'medium', 3) },
    { nome: 'Regatas', img: RENNER_IMG('931495654', 'medium', 3), href: '#/blusas' }
  ];

  /* ---------- Fotos de clientes (Unsplash) ---------- */
  const F = {
    camila:    'photo-1621933638559-fe515af3fbab',
    jaque:     'photo-1643219376906-7977bfd85a19',
    fernanda1: 'photo-1783698670767-1c138e8ec07b',
    fernanda2: 'photo-1783698670624-0c3908ab9123',
    bruna:     'photo-1604342681413-6954ddca1e6f',
    aline:     'photo-1608370946545-7d93571b5593',
    larissa1:  'photo-1783853838738-97389192d052',
    larissa2:  'photo-1783935778665-7a13c05352b8',
    gabriela:  'photo-1788200366428-9bd4702ce79f',
    renata:    'photo-1626879210826-c953d2dfa15f',
    natalia:   'photo-1636249421760-da1f3a877220'
  };
  const FOTO_EXEMPLO = UNSPLASH('photo-1671477828198-2d61e34e0cd6', 600, 760);

  /* ---------- 30 avaliações estruturadas (fictícias) ----------
     modelagem: 'justa' | 'regular' | 'ampla' (sobre o tamanho comprado)   tecido: 'melhor' | 'esperado' | 'pior'
     conforto: 1..3   dias: há quantos dias */
  const R = (id, nome, dias, nota, cor, comprou, modelagem, tecido, conforto, altura, busto, cintura, quadril, uteis, fotos, texto) =>
    ({ id, nome, dias, nota, cor, comprou, modelagem, tecido, conforto, altura, busto, cintura, quadril, uteis, fotos: fotos || [], texto });

  const AVALIACOES = [
    R('r01', 'Camila R.', 6, 5, 'Off White', 'M', 'regular', 'melhor', 3, 163, 91, 74, 102, 24, [F.camila],
      'Comprei a M e ficou justinha do jeito que eu queria, sem apertar. O tecido é grossinho e na off white não marcou nada. Já quero de outras cores!'),
    R('r02', 'Bruna T.', 9, 5, 'Preto', 'P', 'regular', 'esperado', 3, 158, 84, 66, 92, 15, [F.bruna],
      'Básica perfeita. Tenho 1,58 m e o comprimento ficou certinho na cintura da calça, não fica curta nem comprida.'),
    R('r03', 'Larissa M.', 12, 4, 'Off White', 'M', 'justa', 'melhor', 2, 167, 96, 78, 106, 31, [F.larissa1, F.larissa2],
      'Amei a qualidade, mas é bem justinha mesmo. Com busto 96 a M ficou marcando, troquei pela G e ficou perfeita. Se você está no limite entre dois tamanhos, vá no maior.'),
    R('r04', 'Aline P.', 15, 4, 'Preto', 'M', 'regular', 'esperado', 3, 172, 88, 70, 98, 18, [F.aline],
      'Sou alta e fiquei com medo de ficar curta, mas cobre o cós da calça. Só tirei uma estrela porque a gola laceou um pouco depois de umas lavagens.'),
    R('r05', 'Fernanda O.', 18, 4, 'Off White', 'G', 'justa', 'melhor', 2, 161, 104, 88, 112, 42, [F.fernanda1, F.fernanda2],
      'Tenho busto grande e a G ficou apertada no busto e no braço. A GG serviu bem e ficou bonita no corpo. O tecido é ótimo e não fica transparente. Recomendo pedir um tamanho acima se tiver busto maior.'),
    R('r06', 'Patrícia L.', 20, 5, 'Vermelho', 'PP', 'regular', 'melhor', 3, 155, 82, 64, 90, 7, [],
      'Ficou linda, o vermelho é bem vivo igual na foto. Sou mignon e não ficou comprida.'),
    R('r07', 'Jaqueline F.', 22, 5, 'Off White', 'M', 'regular', 'esperado', 3, 166, 90, 73, 99, 21, [F.jaque],
      'Exatamente o que eu procurava pra usar com blazer no trabalho. Veste certinho no M, sem sobrar e sem apertar.'),
    R('r08', 'Renata C.', 25, 5, 'Cinza Escuro', 'M', 'regular', 'esperado', 2, 169, 93, 76, 103, 11, [F.renata],
      'Veste bem no M, mas é justa no braço. Pra quem gosta de blusa mais soltinha, talvez a G seja melhor.'),
    R('r09', 'Thaís B.', 27, 3, 'Off White', 'P', 'justa', 'esperado', 2, 164, 89, 71, 97, 19, [],
      'Pedi P porque costumo usar P em blusa, mas ficou curta e apertada. Troquei pela M e ficou boa. A modelagem é pequena.'),
    R('r10', 'Gabriela N.', 30, 5, 'Preto', 'P', 'regular', 'melhor', 3, 174, 85, 67, 95, 9, [F.gabriela],
      'Tenho 1,74 m e ficou ótima, o comprimento não ficou curto. Malha macia e encorpada.'),
    R('r11', 'Débora S.', 33, 5, 'Off White', 'G', 'regular', 'melhor', 3, 160, 100, 84, 108, 13, [],
      'Comprei G e serviu perfeitamente. Valoriza o corpo sem marcar demais. Lavei várias vezes e não encolheu.'),
    R('r12', 'Vanessa A.', 35, 5, 'Marrom', 'M', 'regular', 'esperado', 3, 162, 92, 75, 101, 5, [],
      'Bonita e confortável. O marrom é um pouco mais claro do que parece na foto.'),
    R('r13', 'Mariana K.', 37, 3, 'Preto', 'M', 'justa', 'esperado', 2, 170, 97, 80, 105, 16, [],
      'Achei a modelagem pequena. A M ficou marcando muito, precisei trocar pela G.'),
    R('r14', 'Isabela G.', 40, 5, 'Bordô', 'PP', 'regular', 'melhor', 3, 157, 80, 62, 88, 4, [],
      'Linda! Ficou justinha no corpo, do jeitinho que eu queria.'),
    R('r15', 'Carolina D.', 42, 5, 'Preto', 'M', 'regular', 'melhor', 3, 165, 91, 74, 100, 12, [],
      'Já é a terceira que eu compro. Veste igual em todas as cores, o M pra mim é certeiro.'),
    R('r16', 'Priscila V.', 44, 4, 'Off White', 'GG', 'regular', 'esperado', 2, 168, 108, 92, 116, 22, [],
      'Serviu na GG, mas no limite. Queria que tivesse um tamanho maior. No busto fica bem justinha.'),
    R('r17', 'Letícia H.', 46, 2, 'Off White', 'P', 'regular', 'pior', 2, 163, 86, 68, 94, 27, [],
      'O tamanho ficou bom, mas na off white fica um pouco transparente, precisa de sutiã nude. Esperava um tecido mais grosso.'),
    R('r18', 'Amanda R.', 50, 5, 'Verde', 'M', 'regular', 'melhor', 3, 159, 94, 77, 104, 6, [],
      'Amei o verde, é bem fechado e elegante. Ficou ótima no M.'),
    R('r19', 'Natália E.', 52, 4, 'Off White', 'M', 'regular', 'esperado', 3, 176, 90, 72, 99, 10, [F.natalia],
      'Pra quem é alta como eu (1,76 m), ficou um pouco curtinha, mas dá pra usar com calça de cintura alta.'),
    R('r20', 'Rafaela J.', 55, 4, 'Preto', 'M', 'ampla', 'esperado', 3, 161, 87, 70, 96, 8, [],
      'Pedi M com medo de ficar apertada e ficou um pouco folgada. Pra mim a P teria ficado melhor.'),
    R('r21', 'Beatriz M.', 58, 5, 'Marrom Café', 'P', 'justa', 'melhor', 2, 166, 89, 71, 98, 14, [],
      'A P ficou apertada no busto, troquei pela M. O tecido é muito bom e não desbota.'),
    R('r22', 'Kelly S.', 60, 5, 'Preto', 'G', 'regular', 'melhor', 3, 154, 99, 83, 107, 9, [],
      'Sou baixinha e tenho busto maior. A G ficou ótima e não ficou comprida.'),
    R('r23', 'Jéssica L.', 63, 5, 'Off White', 'M', 'regular', 'melhor', 3, 168, 95, 79, 104, 3, [],
      'Perfeita pra usar por baixo de tudo. Veste no tamanho.'),
    R('r24', 'Tatiane O.', 66, 3, 'Off White', 'G', 'justa', 'esperado', 1, 171, 102, 86, 110, 17, [],
      'Ficou apertada no braço e encolheu um pouco depois de lavar. Troquei pela GG.'),
    R('r25', 'Luana P.', 70, 5, 'Vermelho', 'P', 'regular', 'melhor', 3, 162, 83, 65, 91, 2, [],
      'Amei! Fica muito bonita com jeans.'),
    R('r26', 'Sabrina F.', 74, 4, 'Preto', 'M', 'justa', 'esperado', 2, 165, 92, 76, 102, 11, [],
      'Gosto de blusa mais soltinha, então a G ficou melhor pra mim. Na M ela fica bem colada.'),
    R('r27', 'Lorena C.', 78, 5, 'Cinza Escuro', 'M', 'regular', 'melhor', 3, 158, 88, 72, 99, 4, [],
      'Ótimo custo-benefício, já comprei de três cores.'),
    R('r28', 'Michele A.', 82, 1, 'Off White', 'G', 'regular', 'pior', 1, 173, 96, 79, 106, 9, [],
      'Veio com um fio puxado na manga e a costura torta. O tamanho ficou ok, mas a qualidade decepcionou.'),
    R('r29', 'Paula R.', 85, 5, 'Bordô', 'P', 'regular', 'melhor', 3, 160, 85, 68, 93, 1, [],
      'Cor linda e veste certinho no P.'),
    R('r30', 'Eduarda V.', 90, 4, 'Off White', 'G', 'regular', 'esperado', 2, 167, 98, 82, 108, 7, [],
      'Veste bem na G. É justa, então se você está entre M e G, pegue a G.')
  ];

  /* ---------- Histórico da cliente (pedidos já avaliados) ---------- */
  const PEDIDOS_ANTERIORES = (hoje, DIA) => ([
    {
      // já liberado de propósito: o único cashback PENDENTE da conta deve ser o da avaliação feita no teste
      id: '1036587120', seed: true, criadoEm: hoje - 16 * DIA, entregueEm: hoje - 10 * DIA,
      pagamento: 'Cartão Renner •••• 4821', frete: 14.90, total: 84.80,
      itens: [{ prod: 'regata-ribana', nome: 'Regata Básica em Ribana com Alças Largas', img: RENNER_IMG('931495654', 'medium', 3), cor: 'Preto', tam: 'M', qtd: 1, preco: 69.90,
        avaliacao: { pts: 70, em: hoje - 9 * DIA, fotos: 0, uteis: 4, campos: ['nota', 'comprado', 'modelagem', 'tecido', 'conforto', 'altura', 'busto', 'cintura', 'quadril', 'comentario'] } }]
    },
    {
      id: '1031244509', seed: true, criadoEm: hoje - 52 * DIA, entregueEm: hoje - 45 * DIA,
      pagamento: 'Pix', frete: 0, total: 99.90,
      itens: [{ prod: 'vestido-midi', nome: 'Vestido Midi Alfaiatado com Cinto Delicado', img: RENNER_IMG('930897352', 'medium', 3), cor: 'Marrom', tam: 'M', qtd: 1, preco: 99.90,
        avaliacao: { pts: 100, em: hoje - 44 * DIA, fotos: 2, uteis: 23, campos: ['nota', 'comprado', 'modelagem', 'tecido', 'conforto', 'altura', 'busto', 'cintura', 'quadril', 'fotos', 'comentario'] } }]
    }
  ]);

  /* ---------- Teste de usabilidade ---------- */
  const TAREFAS = [
    { id: 'T1', tcc: 'Tarefa 1 do TCC', titulo: 'Encontrar a nota e a modelagem da peça',
      cenario: 'Você quer comprar uma blusa básica para o dia a dia. Entre na loja, encontre a Blusa Básica Justinha e me diga qual é a nota dessa blusa e como as clientes avaliam a modelagem dela: justa, regular ou ampla.',
      criterio: 'Sucesso: diz a nota da peça (não a da loja) e a modelagem. Encerre manualmente.', inicio: 'Home', auto: null },
    { id: 'T2', tcc: 'Tarefa 2 do TCC', titulo: 'Filtrar avaliações e escolher um tamanho',
      cenario: 'Você tem 1,65 m. Veja as avaliações de clientes da sua altura (ou do tamanho que você usa), escolha o tamanho que compraria e coloque a blusa na sacola.',
      criterio: 'Encerra sozinha quando a blusa vai para a sacola. Registra filtros usados e tamanho escolhido.', inicio: 'Página do produto', auto: 'add_sacola' },
    { id: 'T3', tcc: 'Jornada de compra (extra)', titulo: 'Finalizar a compra',
      cenario: 'Agora finalize a compra da blusa, do jeito que você faria normalmente.',
      criterio: 'Encerra sozinha quando o pedido é confirmado.', inicio: 'Onde a participante estiver', auto: 'pedido' },
    { id: 'T4', tcc: 'Tarefa 3 do TCC', titulo: 'Acessar a avaliação pelo pós-compra',
      cenario: 'Passaram-se 5 dias e a blusa chegou na sua casa. Você abre a loja de novo. Encontre onde avaliar a blusa que você comprou.',
      criterio: 'Encerra sozinha quando o formulário de avaliação abre. Registra por onde ela entrou (push, pop-up, lembrete ou Meus Pedidos).', inicio: 'Home, 5 dias depois', auto: 'avaliar_aberto' },
    { id: 'T5', tcc: 'Tarefa 4 do TCC', titulo: 'Preencher e enviar o formulário',
      cenario: 'Avalie a blusa preenchendo o que achar importante e envie a avaliação.',
      criterio: 'Encerra sozinha no envio. Registra os pontos ganhos.', inicio: 'Formulário de avaliação', auto: 'avaliacao_enviada' },
    { id: 'T6', tcc: 'Tarefa 5 do TCC', titulo: 'Identificar pontos e data do cashback',
      cenario: 'Quantos pontos você ganhou com essa avaliação, quanto isso vale em cashback e quando esse dinheiro vai ficar disponível para usar?',
      criterio: 'Sucesso: informa os pontos, o valor e a data de liberação. Encerre manualmente.', inicio: 'Onde a participante estiver', auto: null }
  ];

  // SUS – versão em português (escala de 1 a 5)
  const SUS = [
    'Eu acho que gostaria de usar esta loja com frequência.',
    'Eu achei a loja desnecessariamente complexa.',
    'Eu achei a loja fácil de usar.',
    'Eu acho que precisaria da ajuda de uma pessoa com conhecimentos técnicos para usar a loja.',
    'Eu acho que as várias funções da loja estão muito bem integradas.',
    'Eu acho que a loja apresenta muita inconsistência.',
    'Eu imagino que a maioria das pessoas aprenderia a usar esta loja rapidamente.',
    'Eu achei a loja atrapalhada de usar.',
    'Eu me senti confiante ao usar a loja.',
    'Eu precisei aprender várias coisas novas antes de conseguir usar a loja.'
  ];

  window.DADOS = { RENNER_IMG, UNSPLASH, REGRAS, CAMPOS, CLIENTE, PRODUTO, VITRINE, CATEGORIAS, MENU_CARDS, AVALIACOES, FOTO_EXEMPLO, PEDIDOS_ANTERIORES, TAREFAS, SUS };
})();
