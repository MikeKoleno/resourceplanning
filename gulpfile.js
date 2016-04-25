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
    scripts: ['src/js/**/*.*', '!src/js/lambda/**/*.js'],
    styles: 'src/styles/**/*.*',
    images: 'src/img/**/*.*',
    templates: ['src/**/*.tpl.html', 'src/**/*.html', '!src/index.html'],
    index: 'src/index.html',
    bower_fonts: 'src/components/**/*.{ttf,woff,eof,svg}',
    bower_scripts: [
        'src/components/**/**/jquery.min.js',
        'src/components/**/angular.min.js',
        'src/components/**/ui-bootstrap-tpls.min.js',
        'src/components/**/angular-cookies.min.js',
        'src/components/**/angular-local-storage.min.js',
        'src/components/**/angular-ui-router.min.js',
        'src/components/**/aws-sdk.min.js',
        'src/components/**/bootstrap.min.js',
        'src/components/**/build/roundProgress.min.js',
        'src/components/**/dist/ng-notify.min.js'
    ],
    bower_styles: 'src/components/**/*.min.css'
};

gulp.task('clean', function () {
    return gulp.src('www/', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('copy_bower_scripts', function () {
    return gulp.src(paths.bower_scripts)
        .pipe(gulp.dest('www/components'));
});

gulp.task('copy_bower_styles', function () {
    return gulp.src(paths.bower_styles)
        .pipe(gulp.dest('www/components/'));
});

gulp.task('copy_bower_fonts', function () {
    return gulp.src(paths.bower_fonts)
        .pipe(gulp.dest('www/components/'));
});

gulp.task('copy_scripts', function () {
    return gulp.src(paths.scripts)
        .pipe(gulp.dest('www/js'));
});

gulp.task('copy_styles', function () {
    return gulp.src(paths.styles)
        .pipe(less())
        .pipe(concat('resource-planning.css'))
        .pipe(gulp.dest('www/styles'));
});

gulp.task('copy_assets', function () {
    return gulp.src(paths.images)
        .pipe(gulp.dest('www/assets/images'));
});

gulp.task('templates', function () {
    return gulp.src(paths.templates)
        .pipe(templateCache({
            module: 'RDash'
        }))
        .pipe(gulp.dest('www/js'))
        .pipe(connect.reload())
});

gulp.task('index', function () {
    var sources = gulp.src(['www/components/**/**/jquery.min.js',
        'www/components/**/angular.min.js',
        'www/components/**/ui-bootstrap-tpls.min.js',
        'www/components/**/angular-cookies.min.js',
        'www/components/**/angular-local-storage.min.js',
        'www/components/**/angular-ui-router.min.js',
        'www/components/**/aws-sdk.min.js',
        'www/components/**/bootstrap.min.js',
        'www/components/**/build/roundProgress.min.js',
        'www/components/**/dist/ng-notify.min.js',
        'www/**/*.js',
        'www/**/*.min.css',
        'www/**/*.css'
    ], {read: false});

    return gulp.src(paths.index)
        .pipe(concat('index.html'))
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('./www/'));
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