angular.module("app", []).controller("ctrl", function($scope, $http) {
    $scope.model = {};

    $scope.API_BASE = "https://covid-api.mmediagroup.fr/v1";

    $scope.model.tipos = [
        { id: 1, label: "Casos confirmados" },
        { id: 2, label: "Muertes" },
    ];

    $scope.model.paises = [];

    $scope.is_loading = false;
    $scope.error_data = false;

    $scope.paises_get = function() {
        $http({
            url: "https://raw.githubusercontent.com/M-Media-Group/country-json/master/src/countries-master.json",
            method: "GET"
        }).then(function(response) {
            $scope.model.paises = response.data;
        });
    };
    $scope.paises_get();

    $scope.data_get = function(country_iso, status) {
        $scope.is_loading = true;
        $scope.error_data = false;
        $http({
            url: $scope.API_BASE + "/history?ab=" + country_iso + "&status=" + status,
            method: "GET"
        }).then(function(response) {
            if (response.data.All) {
                data = response.data.All.dates;
                data_render = [];
                categories = [];
                let i = 0;
                for (index in data) {
                    data_render.push(data[index]);
                    categories.push(index);
                    i++;
                    if (i >= 30) {
                        break;
                    }
                }
                $scope.is_loading = false;
                data_render = data_render.reverse();
                categories = categories.reverse();
                $scope.render_chart(data_render, categories, status);
            } else {
                $scope.is_loading = false;
                $scope.error_data = true;
            }


        }, function() {
            $scope.error_data = true;
        });
    };

    $scope.submit = function(e) {
        e.preventDefault();

        let country_iso = $scope.filtro.pais.abbreviation;

        let status = $scope.filtro.status.id == 1 ? "Confirmed" : "Deaths";
        $scope.data_get(country_iso, status);
    }
    $scope.render_chart = function(data, categories, status) {
        Highcharts.chart('char-area', {
            rangeSelector: {
                selected: 1
            },
            title: {
                text: (status == "Deaths" ? "Muertes" : "Casos confirmados") + ' de los últimos 30 dias de ' + $scope.filtro.pais.country
            },
            xAxis: {
                categories: categories
            },
            series: [{
                name: (status == "Deaths" ? "Muertes" : "Casos confirmados"),
                data: data,
                tooltip: {
                    valueDecimals: 0
                }
            }]
        });
    }



});