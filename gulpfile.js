var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var jsFiles = ['*.js', 'src/**/*.js'];
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');

gulp.task('default',function() {
    gulp.watch('./public/css/sass/**/*.scss',['compileSASS']);
});
gulp.task('compileSASS', function() {
  var sass = require('gulp-sass');
  gulp.src('./public/css/sass/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./public/css/'));
})
gulp.task('inject', function() {
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');
    var injectSrc = gulp.src(['./public/css/*.css', './public/js/*.js'], {
        read: false
    });

    var injectOptions = {
        ignorePath: '/public'
    };

    var options = {
        bowerJson: require('./bower.json'),
        directory: './public/lib',
        ignorePath: '../../public'
    };

    return gulp.src('./src/views/layout.ejs')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./src/views'));
});

//to compile the JS files

gulp.task('compileJSFiles', function() {
    var localJSFiles = 'public/localJS/*.js';
    // console.log('compiling local JS Files');
    return gulp.src(localJSFiles)
        .pipe(concat('everything.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/compiledFiles/'));
});

//to compile the css files

gulp.task('compileCSSFiles', function () {
    var localFiles = 'public/localCSS/*.css';
    // console.log('compiling CSS Files')
    return gulp.src(localFiles)
        .pipe(concat('everything.css'))
        .pipe(uglifycss())
        .pipe(gulp.dest('./public/compiledFiles/'));
});

//to start the server and do the compiling
gulp.task('serve', ['inject', 'compileSASS', 'compileJSFiles', 'compileCSSFiles', 'default'], function() {
    var options = {
        script: 'app.js',
        delayTime: 1,
        env: {
            'PORT': 5000
        },
        watch: jsFiles
    };

    return nodemon(options)
        .on('restart', function(ev) {
            console.log("Server is restarting");
        })
});
