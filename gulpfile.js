const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const server = require('browser-sync').create();

const paths ={
  scssPath:'src/scss/**/*.scss',
  jsPath:'src/js/**/*.js'
}

function scssTask(){    
  return gulp.src(paths.scssPath)
        .pipe(sourcemaps.init()) 
        .pipe(sass()) 
        .pipe(postcss([ autoprefixer(), cssnano() ])) 
        .pipe(sourcemaps.write('.')) 
        .pipe(gulp.dest('build/css'))
        .pipe(server.stream({match: '**/*.css'}));
}

function htmlTask(){
  return gulp.src('src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

function jsTask(){
  return gulp.src([paths.jsPath])
      .pipe(concat('app.js'))
      .pipe(uglify())
      .pipe(gulp.dest('build/js')
  );
}


function watchTask(){
  server.init({
    server: {
      baseDir: './build'
    }
  });
 gulp.watch(paths.scssPath,scssTask);
 gulp.watch('src/*.html',htmlTask).on('change', server.reload);
 gulp.watch(paths.jsPath,jsTask).on('change',server.reload);
 
}

exports.default = gulp.series(
  gulp.parallel(htmlTask,scssTask,jsTask), 
  watchTask
);