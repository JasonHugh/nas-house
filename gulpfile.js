var gulp = require('gulp');
// 引入依赖包
var sass = require('gulp-sass');
var minifyCSS = require('gulp-clean-css');
var browsersync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var reload = browsersync.reload;
var fileinclude  = require('gulp-file-include');
gulp.task('fileinclude', function() {
    // 适配page中所有文件夹下的所有html，排除page下的public文件夹中html
    gulp.src(['app/index.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('npc'));
    gulp.src(['app/view/**/*.html','!app/view/public/*.html'])
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
    .pipe(gulp.dest('npc/view'))
    .pipe(reload({stream:true}));
});
gulp.task('sass', function(){
    //sass()方法用于转换sass到css
  gulp.src('./app/scss/*')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    //.pipe(minifyCSS())
    .pipe(gulp.dest('./npc/css'))
    .pipe(reload({stream:true}));
});

gulp.task('scripts', function() {
    gulp.src('./app/js/**/*.js')
        //.pipe(concat('all.js'))
        //.pipe(gulp.dest('./dist'))
        //.pipe(rename('all.min.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('./npc/js'))
        .pipe(reload({stream:true}));
});
gulp.task('images', function() {
    gulp.src('./app/images/*')
        .pipe(gulp.dest('./npc/images'))
        .pipe(reload({stream:true}));
});
gulp.task('watch', function(){
    gulp.watch('./app/scss/*.scss', ['sass']);
    gulp.watch('./app/js/**/*.js', ['scripts']);
    gulp.watch('./app/**/*.html', ['fileinclude']);
    gulp.watch('./app/images/*', ['images']);
});
gulp.task('server', function() {
    gulp.start('sass','scripts','images','fileinclude','watch');
    browsersync.init({
        port: 3000,
        server: {
            baseDir: ['npc']
        }
    });
});

gulp.task('default',['server']);