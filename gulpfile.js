var bower_folder = "assets/bower_components";

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync'),
    less = require('gulp-less'),
    bootsie = require('gulp-bootsie')('conf.json'),
    path = require("path"),
    bower = require('gulp-bower'),

    postcss= require('gulp-postcss');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var usemin = require('gulp-usemin'),

    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html');

var reload      = browserSync.reload;


var options = {
    server_host: "192.168.64.101"
}
var src_dir = "./src";
var build_dir = "./build";
var release_dir = "./release";


gulp.task('copy-assets', ["imgs"],function () {
    var less_dir = "assets/less/*";
    var css_dir = "assets/css/*";
    var js_dir = "assets/js/*";
    return gulp.src(
        [
            path.join(src_dir, less_dir),
            path.join(src_dir, css_dir),
            path.join(src_dir, js_dir)
        ],{base:src_dir})
        .pipe(gulp.dest(path.join(build_dir)))
        .pipe(reload({stream:true}));
});

gulp.task('imgs', function () {
    var current_dir = "assets/img";
    return gulp.src(path.join(src_dir, current_dir)+"/*")

        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.join(build_dir, current_dir)))
        .pipe(reload({stream:true}));
});

gulp.task("bower-command", ['bower_files'],function(){
    var source_path = path.join(src_dir,'assets');
    var dest_path = path.join(build_dir,'assets');

    return bower({ cwd: dest_path })
        .pipe(gulp.dest(dest_path )) ;

});

gulp.task('bower_files', function () {
    var current_dir = bower_folder;
    return gulp.src([
        path.join(src_dir, "assets")+"/bower.json",
        path.join(src_dir, "assets")+"/.bowerrc"
    ])
        .pipe(gulp.dest(path.join(build_dir, "assets")));
});

gulp.task('browser-sync', function() {
    browserSync({
        host:options.server_host,
        server: {
            baseDir: build_dir
        }
    });
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});


gulp.task("bootsie-build",["copy-assets"], function(){
    var search_path = path.join(process.cwd(),src_dir);

    return gulp.src([src_dir+"/w*.json"])
        .pipe(bootsie.build())

        .pipe(sourcemaps.init())
        .pipe(usemin({
            less:[less()],
            css: [autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }),minifyCss(), 'concat'],
            html: [minifyHtml({empty: true})],
            js: [uglify()]
        }))
        .pipe(sourcemaps.write())

        .pipe(gulp.dest("."))
        .pipe(reload({stream:true}))
        ;

});


gulp.task('default', ["bootsie-build","bower_files","imgs",

    'browser-sync'], function(){

    gulp.watch([
            src_dir+"/assets/img/**/*.jpg",
            src_dir+"/assets/img/**/*.png",
            src_dir+"/assets/img/**/*.svg"],
        ["imgs"]
    );


    gulp.watch([
        src_dir+"/assets/**/*.less",
        src_dir+"/assets/**/*.js",
        src_dir+"/assets/**/*.css",
        src_dir+"/**/*.html",
        src_dir+"/**/*.json",
        src_dir+"/**/*.md"
    ], ['bootsie-build']);

    gulp.watch([
        build_dir+"/assets/**/*.less",
        build_dir+"/assets/**/*.js",
        build_dir+"/assets/**/*.css",
        build_dir+"/**/*.html"
    ], function (file) {
        //[reload]);
        if (file.type === "changed") {
            reload(file.path);
        }
    });

    gulp.watch(
        path.join(src_dir,bower_folder)+"/**/*",
        ["bower-command"]
    );


});
