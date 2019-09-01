const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const cachebust = require("gulp-cache-bust");
const server = require("browser-sync").create();
const imagemin = require("gulp-imagemin");

const babel = require("gulp-babel");
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const babelify = require("babelify");
const source = require("vinyl-source-stream");

const paths = {
  scssPath: "src/scss/**/*.scss",
  jsPath: "src/js/**/*.js",
  imgPath: "src/img/*"
};


function scssTaskDev() {
  return gulp
  .src(paths.scssPath)
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("build/css"))
  .pipe(server.stream({ match: "**/*.css" }));
}

function scssTaskBuild() {
  return gulp
    .src(paths.scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/css"))
}

function jsTaskDev() {
  return (
    browserify({
        entries: ["./src/js/main.js"],
        transform: ['babelify']
        })
        // Bundle it all up!
        .bundle()
        .on('error', function (err) {
          console.error(err)
          this.emit('end')
        })
        // Source the bundle
        .pipe(source("app.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        // Then write the resulting files to a folder
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./build/js"))
);
}

function jsTaskBuild() {
  return (
    browserify({
        entries: ["./src/js/main.js"],
        transform: ['babelify']
        })
        // Bundle it all up!
        .bundle()
        .on('error', function (err) {
          console.error(err)
          this.emit('end')
        })
        // Source the bundle
        .pipe(source("app.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        // Then write the resulting files to a folder
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./build/js"))
);
}

function htmlTaskDev() {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: false }))
    .pipe(gulp.dest("build"));
}

function htmlTaskBuild() {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}


function imgSquooshTask() {
  return gulp
    .src(paths.imgPath)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo()
      ])
    )
    .pipe(gulp.dest("build/img"));
}

function cache() {
  return gulp
    .src("./build/**/*.html")
    .pipe(
      cachebust({
        type: "timestamp"
      })
    )
    .pipe(gulp.dest("./build"));
}

function watchTask() {
  server.init({
    server: {
      baseDir: "./build"
    }
  });
  gulp.watch(paths.scssPath, scssTaskDev);
  gulp.watch("src/*.html", htmlTaskDev).on("change", server.reload);
  gulp.watch(paths.jsPath, jsTaskDev).on("change", server.reload);
}

exports.dev = gulp.series(
  gulp.parallel(htmlTaskDev, scssTaskDev, jsTaskDev,imgSquooshTask),
  watchTask
);

exports.build = gulp.series(
  gulp.parallel(htmlTaskBuild, scssTaskBuild, jsTaskBuild,imgSquooshTask,cache),
);
