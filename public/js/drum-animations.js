//Square Pulse
function animateSquarePulse(drum) {
    var clone = drum.clone();
    var width = drum.width();
    var height = drum.height();
    clone.css('opacity', 0);
    clone.css('width', 0)
    clone.css('height', 0);
    var animationDetails = squarePulse(width);
    clone.insertAfter(drum);
    clone.velocity(animationDetails[0],  1000, function() {
      clone.velocity(animationDetails[1], 500, function() {
        clone.remove();
      })
    });
}
var squarePulse = function(width) {
  var start = {
    width: width,
    height: width,
    opacity: 0.8
  }
  var success = {
    width: width * 3,
    height: height * 3,
    opacity: 0
  }
  var fail = {

  }
  return [start, success, fail];
}
