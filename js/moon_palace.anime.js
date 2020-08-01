if (typeof window.moon_palace !== "object") window.moon_palace = {};

(function () {

var anime = {};

anime.playExitAnime = function (element) {
	var anime = element.attr("exit-anime");
	if (anime) element.removeClass(anime);
	if (anime) element.addClass(anime);
};

window.moon_palace.anime = anime;
}) ();
