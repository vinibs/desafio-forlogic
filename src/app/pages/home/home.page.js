page = { // The variable 'page' must receive the object with the page data

    title: 'Desafio 4 Devs', // Page title to be shown in the browser
    pageFile: 'home.page.html', // Relative to this JS file
    handler: function() {
        var avaliacoes = document.getElementById('avaliacoes');

        app.ajax({
            url: apiUrl+'evaluations',
            headers: {'Authorization':appname},
            beforeSend: function() {
                avaliacoes.innerText = 'Carregando...';
            },
            success: function(data) {
                var lista = {};

                avaliacoes.innerText = '';

                if(data.status === 200)
                    lista = JSON.parse(data.response);

                if(Object.keys(lista).length === 0)
                    avaliacoes.innerText = 'Nenhuma avaliação cadastrada.';

                else
                    for(var i in lista) {

                        // Calcula a porcentagem de avaliações já realizadas
                        var clientes = lista[i].clientes;
                        var totalClientes = 0;
                        var totalAvaliados = 0;

                        var promotores = 0;
                        var neutros = 0;
                        var detratores = 0;

                        for(var j in clientes) {
                            totalClientes++;

                            if(clientes[j].nota) {
                                totalAvaliados++;
                                var nota = clientes[j].nota;

                                if(nota >= 0 && nota <= 6)
                                    detratores++;
                                else if(nota >= 7 && nota <= 8)
                                    neutros++;
                                else if(nota >= 9 && nota <= 10)
                                    promotores++;

                            }
                        }

                        var quantAvaliado = totalAvaliados/totalClientes * 100;


                        // Calcula o resultado geral da avaliação
                        var classeBloco = '';
                        var textoMeta = 'Meta ainda não calculada';

                        // Caso tenha sido totalmente avaliada, define os atributos e faz o cálculo
                        if(quantAvaliado === 100){
                            var nps = ((promotores - detratores) / totalClientes) * 100;
                            if(nps >= 80) {
                                classeBloco = 'success';
                                textoMeta = 'Meta atingida!';
                            }
                            else if(nps >= 60 && nps < 80) {
                                classeBloco = 'warning';
                                textoMeta = 'Meta dentro da tolerância'
                            }
                            else {
                                classeBloco = 'fail';
                                textoMeta = 'Meta não atingida!';
                            }
                        }


                        // Cria os elementos para exibição
                        var avaliacao = document.createElement('span');
                        avaliacao.id = i;
                        avaliacao.className = 'referencia-avaliacao';
                        avaliacao.innerHTML = lista[i].mes+'/'+lista[i].ano;

                        var porcentagem = document.createElement('span');
                        porcentagem.innerHTML = quantAvaliado + '%';
                        porcentagem.className = 'porcentagem';

                        var labelAvaliado = document.createElement('span');
                        labelAvaliado.className = 'label-avaliado';
                        labelAvaliado.innerHTML = 'Avaliado';

                        var bloco = document.createElement('div');
                        bloco.className = 'block '+classeBloco;
                        bloco.title = textoMeta;


                        bloco.appendChild(avaliacao);
                        bloco.appendChild(porcentagem);
                        bloco.appendChild(labelAvaliado);

                        avaliacoes.appendChild(bloco);

                    }
            }
        });

    } // JS function to be executed when the page is loaded.
};