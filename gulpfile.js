var gulp = require('gulp'),
    inject = require('gulp-inject'),
    clean = require('gulp-clean'),
    usemin = require('gulp-usemin'),
    wrap = require('gulp-wrap'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    minifyCss = require('gulp-minify-css'),
    minifyJs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    templateCache = require('gulp-angular-templatecache'),
    minifyHTML = require('gulp-minify-html');

var paths = {
    scripts: 'src/js/**/*.*',
    styles: 'src/styles/**/*.*',
    images: 'src/img/**/*.*',
    templates: ['src/**/*.tpl.html', 'src/**/*.html', '!src/index.html'],
    index: 'src/index.html',
    bower_fonts: 'src/components/**/*.{ttf,woff,eof,svg}',
    bower_scripts: [
        'src/components/**/**/jquery.min.js',
        'src/components/**/**/moment.min.js',
        'src/components/**/angular.min.js',
        'src/components/**/ui-bootstrap-tpls.min.js',
        'src/components/**/angular-cookies.min.js',
        'src/components/**/angular-local-storage.min.js',
        'src/components/**/angular-ui-router.min.js',
        'src/components/**/aws-sdk.min.js',
        'src/components/**/bootstrap.min.js',
        'src/components/**/src/calendar.js',
        'src/components/**/dist/fullcalendar.min.js',
        'src/components/**/dist/gcal.js',
        'src/components/**/build/roundProgress.min.js'
    ],
    bower_styles: 'src/components/**/*.min.css'
};

gulp.task('clean', function () {
    return gulp.src('dist/', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('copy_bower_scripts', function () {
    return gulp.src(paths.bower_scripts)
        .pipe(gulp.dest('dist/components'));
});

gulp.task('copy_bower_styles', function () {
    return gulp.src(paths.bower_styles)
        .pipe(gulp.dest('dist/components/'));
});

gulp.task('copy_bower_fonts', function () {
    return gulp.src(paths.bower_fonts)
        .pipe(gulp.dest('dist/components/'));
});

gulp.task('copy_scripts', function () {
    return gulp.src(paths.scripts)
        .pipe(gulp.dest('dist/js'));
});

gulp.task('copy_styles', function () {
    return gulp.src(paths.styles)
        .pipe(less())
        .pipe(concat('resource-planning.css'))
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('copy_assets', function () {
    return gulp.src(paths.images)
        .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('templates', function () {
    return gulp.src(paths.templates)
        .pipe(templateCache({
            module: 'RDash'
        }))
        .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload())
});

gulp.task('index', function () {
    var target = gulp.src('/src/index.html');
    var sources = gulp.src(['dist/components/**/**/jquery.min.js',
        'dist/components/**/**/moment.min.js',
        'dist/components/**/angular.min.js',
        'dist/components/**/ui-bootstrap-tpls.min.js',
        'dist/components/**/angular-cookies.min.js',
        'dist/components/**/angular-local-storage.min.js',
        'dist/components/**/angular-ui-router.min.js',
        'dist/components/**/aws-sdk.min.js',
        'dist/components/**/bootstrap.min.js',
        'dist/components/**/**/calendar.js',
        'dist/components/**/dist/fullcalendar.min.js',
        'dist/components/**/dist/gcal.js',
        'dist/components/**/build/roundProgress.min.js',
        'dist/**/*.js',
        'dist/**/*.min.css',
        'dist/**/*.css'
    ], {read: false});

    return gulp.src(paths.index)
        .pipe(concat('index.html'))
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-tasks', ['copy_bower_scripts', 'copy_bower_styles', 'copy_bower_fonts', 'copy_scripts', 'copy_styles', 'copy_assets', 'templates'], function () {
    gulp.start(['index']);
});

gulp.task('build', ['clean'], function () {
    return gulp.start(['build-tasks']);
});

gulp.task('watch', function () {
    gulp.watch([paths.images], ['build']);
    gulp.watch([paths.styles], ['build']);
    gulp.watch([paths.scripts], ['build']);
    gulp.watch([paths.templates], ['build']);
    gulp.watch([paths.index], ['build']);
});

gulp.task('default', ['build', 'watch']);