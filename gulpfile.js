var gulp = require('gulp');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var csso = require('gulp-csso');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var Server = require('karma').Server;

gulp.task('sass', function() {
  return gulp.src('app/sass-theme/main.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulpif(argv.production, csso()))
    .pipe(gulp.dest('public/css'));
});

gulp.task('angular', function() {
  return gulp.src([
    'app/app.js',
    'app/components/**/*.js',
    'app/services/*.js'
  ])
    .pipe(concat('application.js'))
    .pipe(ngAnnotate())
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/js'));
});

gulp.task('templates', function() {
    return gulp.src('app/components/**/*.html')
        .pipe(templateCache({ root: 'components', module: 'MyApp' }))
        .pipe(gulpif(argv.production, uglify()))
        .pipe(gulp.dest('public/js'));
});

gulp.task('vendor', function() {
  return gulp.src('app/vendor/*.js')
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/js/lib'));
});

gulp.task('watch', function() {
  gulp.watch(['app/sass-theme/**/*.scss', 'app/components/**/*.scss'], ['sass']);
  gulp.watch('app/components/**/*.html', ['templates']);
  gulp.watch('app/**/*.js', ['angular']);
});


/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/app/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('build', ['sass', 'angular', 'vendor', 'templates']);
gulp.task('default', ['build', 'watch']);
