(function ($) {

    $(".sparkline8").sparkline([79, 72, 29, 6, 52, 32, 73, 40, 14, 75, 77, 39, 9, 15, 10], {
        type: "line",
        width: "200px",
        height: "25",
        lineColor: "rgb(47, 44, 216)",
        fillColor: "rgba(47, 44, 216, .5)",
        minSpotColor: "rgb(47, 44, 216)",
        maxSpotColor: "rgb(47, 44, 216)",
        highlightLineColor: "rgb(47, 44, 216)",
        highlightSpotColor: "rgb(47, 44, 216)"
    });

    $("#sparkline11").sparkline([27, 73], {
        type: "pie",
        height: "170",
        resize: !0,
        sliceColors: ["rgba(22, 82, 240, 0.2)", "rgba(22, 82, 240, 0.95)"]
    });

})(jQuery); 