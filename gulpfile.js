// generated on 2017-06-17 using generator-webapp 3.0.1

const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');
const replace = require('gulp-replace');
const babel = require('gulp-babel');
const gulpSequence = require('gulp-sequence');
const shell = require('gulp-shell');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

function lint(files) {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('./**/scripts/*.js')
    .pipe(gulp.dest('./**/scripts'));
});

gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

gulp.task('styles', () => {
  return gulp.src(['./**/styles/*.css'])
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src(['./**/scripts/*.js', '!./**/{node_modules,node_modules/**}'])
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('images', () => {
  return gulp.src('bigtiger/contrib/admin/static/admin/images/**/*')
  .pipe(gulp.dest('dist/static/admin/images/'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('bigtiger/contrib/admin/static/admin/fonts/**/*'))
    .pipe($.if(dev, gulp.dest('dist/static/admin/fonts'), gulp.dest('dist/static/admin/fonts')));
});

gulp.task('html', ['styles', 'scripts', 'fonts'], () => {
  return gulp.src('./**/templates/**/*.htm')
    .pipe($.useref({searchPath: ['.tmp', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('conf', () => {
  return gulp.src(['./conf/*'])
  .pipe(gulp.dest('dist/conf'));
});

gulp.task('setup', () => {
	return gulp.src(['setup.py', 'MANIFEST.in'])
	.pipe(gulp.dest('dist'));
});


gulp.task('layer_skin', () => {
  return gulp.src(['bower_components/layer/build/skin/**/*'])
  .pipe(gulp.dest('dist/static/admin/scripts/skin/'));
});

gulp.task('easyui_images', () => {
  return gulp.src(['bower_components/jquery-easyui/themes/bootstrap/images/**/*'])
  .pipe(gulp.dest('dist/static/admin/styles/images/'));
});

gulp.task('My97DatePicker', () => {
  return gulp.src(['bower_components/My97DatePicker/**/*'])
  .pipe(gulp.dest('dist/static/My97DatePicker/'));
});

gulp.task('iconstore', () => {
  return gulp.src(['bigtiger/contrib/admin/static/iconstore/**/*'])
  .pipe(gulp.dest('dist/static/iconstore/'));
});

gulp.task('static', () => {
  return gulp.src(['dist/static/**/*'])
  .pipe(gulp.dest('dist/bigtiger/contrib/admin/static/'));
});


gulp.task('pyc', () => {
  return gulp.src(['./**/*.py', '!./{bower_components,bower_components/**}'])
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['pyc', 'conf', 'html', 'images', 'setup', 'layer_skin', 'easyui_images', 'My97DatePicker', 'iconstore'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('uninstall', shell.task('sudo pip uninstall bigtiger'));
gulp.task('wheel', shell.task(['python setup.py bdist_wheel'], {'cwd': '/Users/fhp/github/bigtiger/dist'}));
gulp.task('install', shell.task(['sudo pip install bigtiger-0.3.7-py2-none-any.whl'], {'cwd': '/Users/fhp/github/bigtiger/dist/dist'}));

gulp.task('build', gulpSequence('clean', 'dist', 'static'));
// gulp.task('setup', gulpSequence('uninstall', 'wheel', 'install'));

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('baseframe/templates/baseframe/base.htm')
    .pipe(wiredep({
      exclude: ['bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('baseframe/templates/baseframe/'));
});
