//This is the handler for Animations.
var data = [];
var frames;
var currentTime = 0;
var audio;
function sendAnimationData(notes, sentAudio) {
  notes = notes.slice(1);
  notes.forEach(function(note) {
    data.push({
      'type': 'drum',
      'time': note.animationTime
    })
  })
  audio = sentAudio;
}
var drum;
$(document).ready(function(){
  drum = $('div.drum');
})


function startAnimations() {
  if (audio.currentTime + 1 > data[0].time) {
    data = data.splice(1);
    animateDrumPulse();
  };
  frames = requestAnimationFrame(startAnimations);
}
function stopAnimations() {
  cancelAnimationFrame(frames);
}
function animateDrumPulse() {
    var clone = drum.clone();
    var width = drum.width();
    var height = drum.height();
    clone.css('opacity', 0);
    clone.css('width', 0)
    clone.css('height', 0);
    clone.insertAfter(drum);
    clone.velocity({
      width: width,
      height: width,
      opacity: 0.8
    },  1000, function() {
      clone.velocity({
        width: width * 3,
        height: height * 3,
        opacity: 0
      }, 500, function() {
        clone.remove();
      })
    });
}
