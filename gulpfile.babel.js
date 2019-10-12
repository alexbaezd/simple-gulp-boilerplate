const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const cachebust = require("gulp-cache-bust");
const imagemin = require("gulp-imagemin");
const babel = require("gulp-babel");
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const server = require("browser-sync").create();
const del = require('del');

const filesDev = {
  scss: "src/scss/**/*.scss",
  js: "src/js/**/*.js",
  img: "src/img/*"
}
const filesDest = "./build"

const scssTaskDev = () => {
  return gulp
    .src(filesDev.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${filesDest}/css`))
    .pipe(server.stream({ match: "**/*.css" }))
}

const scssTaskBuild = () => {
  return gulp
    .src(filesDev.scss)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${filesDest}/css`))
}

const jsTaskDev = () => {
  return browserify({
    entries: ["./src/js/main.js"],
    transform: ["babelify"]
  })
    .bundle()
    .on("error", function(err) {
      console.error(err)
      this.emit("end")
    })
    .pipe(source("app.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${filesDest}/js`))
}

const jsTaskBuild = () => {
  return browserify({
    entries: ["./src/js/main.js"],
    transform: ["babelify"]
  })
    .bundle()
    .on("error", function(err) {
      console.error(err)
      this.emit("end")
    })
    .pipe(source("app.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${filesDest}/js`))
}

const htmlTaskDev = () => {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: false }))
    .pipe(gulp.dest(filesDest))
}

const htmlTaskBuild = () => {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(filesDest))
}

const imgSquooshTask = () => {
  return gulp
    .src(filesDev.img)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo()
      ])
    )
    .pipe(gulp.dest(`${filesDest}/img`))
}

const cache = () => {
  return gulp
    .src("./build/**/*.html")
    .pipe(
      cachebust({
        type: "timestamp"
      })
    )
    .pipe(gulp.dest(filesDest))
}

const clean = () =>{
  return del(["./build/"])
}
const watchTask = () => {
  server.init({
    server: {
      baseDir: "./build"
    }
  })
  gulp.watch(filesDev.scss, scssTaskDev)
  gulp.watch("src/*.html", htmlTaskDev).on("change", server.reload)
  gulp.watch(filesDev.js, jsTaskDev).on("change", server.reload)
}

exports.dev = gulp.series(
  gulp.parallel(htmlTaskDev, scssTaskDev, jsTaskDev, cache),
  watchTask
)

exports.build = gulp.series(clean,
  gulp.parallel(
    htmlTaskBuild,
    scssTaskBuild,
    jsTaskBuild,
    imgSquooshTask,
    cache
  )
)
