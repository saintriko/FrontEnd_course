'use strict';

const gulp = require( 'gulp' ),
    babel = require( 'gulp-babel' ),
    watch = require( 'gulp-watch' ),
    prefixer = require( 'gulp-autoprefixer' ),
    uglify = require( 'gulp-uglify' ),
    cssmin = require( 'gulp-cssmin' ),
    sass = require( 'gulp-sass' ),
    sourcemaps = require( 'gulp-sourcemaps' ),
    rigger = require( 'gulp-rigger' ),
    inject = require( 'gulp-inject' ),
    imagemin = require( 'gulp-imagemin' ),
    pngquant = require( 'imagemin-pngquant' ),
    connect = require( 'gulp-connect' ),
    minifyHTML = require( 'gulp-minify-html' ),
    del = require( 'del' ),
    injectSvg = require( 'gulp-inject-svg' ),
    injectSvgOptions = { base : '../src/' },
    concat = require( 'gulp-concat' ),
    webpack = require( 'webpack' ),
    webpackStream = require( 'webpack-stream' );

const path = {
    build : {
        html : '../',
        js : '../dist/js/',
        css : '../dist/css/',
        img : '../dist/images/',
        fonts : '../dist/fonts/'
    },
    src : {
        html : '../src/*.html',
        js : '../src/js/*.js',
        style : '../src/scss/*.scss',
        img : '../src/images/**/*.*',
        fonts : '../src/fonts/*.scss'
    },
    watch : {
        html : '../src/**/*.html',
        js : '../src/js/**/*.js',
        style : '../src/scss/**/*.scss',
        img : '../src/images/**/*.*'
    }
};

gulp.task( 'clean', () => del( '../dist', { force : true } ) );

gulp.task( 'release:html:build', [ 'release:style:build', 'release:js:build' ], () =>
{
    gulp.src( path.src.html )
        .pipe( rigger() )
        .pipe( injectSvg( injectSvgOptions ) )
        .pipe( minifyHTML() )
        .pipe( gulp.dest( path.build.html ) );
} );

gulp.task( 'release:js:build', () =>
{
    gulp.src( path.src.js )
        .pipe( webpackStream( {
            mode : 'production',
            entry : {
                main : '../src/js/main.js',
            },
            output : {
                filename : '[name].js'
            },
            module : {
                rules : [
                    {
                        test : /\.js$/,
                        exclude : /(node_modules|bower_components)/,
                        use : {
                            loader : 'babel-loader',
                            options : {
                                presets : [ '@babel/preset-env' ]
                            }
                        }
                    }
                ]
            }
        } ) )
        .pipe( gulp.dest( path.build.js ) );
} );

gulp.task( 'release:style:build', () =>
{
    gulp.src( path.src.style )
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( sourcemaps.init() )
        .pipe( prefixer( { remove : false } ) )
        .pipe( cssmin() )
        .pipe( gulp.dest( path.build.css ) );
} );

gulp.task( 'release:fonts:build', () =>
{
    gulp.src( '../src/fonts/fonts/**/*.*' )
        .pipe( gulp.dest( '../dist/fonts/fonts' ) );

    gulp.src( path.src.fonts )
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( sourcemaps.init() )
        .pipe( prefixer() )
        .pipe( cssmin() )
        .pipe( gulp.dest( path.build.fonts ) );
} );

gulp.task( 'release:image:build', () =>
{
    gulp.src( path.src.img )
        .pipe( imagemin( {
            progressive : true,
            svgoPlugins : [ { removeViewBox : false } ],
            use : [ pngquant() ]
        } ) )
        .pipe( gulp.dest( path.build.img ) );
} );

gulp.task( 'html:build', () =>
{
    gulp.src( path.src.html )
        .pipe( rigger() )
        .pipe( injectSvg( injectSvgOptions ) )
        .pipe( gulp.dest( path.build.html ) )
        .pipe( connect.reload() );
} );

gulp.task( 'js:build', () =>
{
    gulp.src( path.src.js )
        .pipe( webpackStream( {
            mode : 'development',
            entry : {
                main : '../src/js/main.js',
            },
            output : {
                filename : '[name].js'
            },
            module : {
                rules : [
                    {
                        test : /\.js$/,
                        exclude : /(node_modules|bower_components)/,
                        use : {
                            loader : 'babel-loader',
                            options : {
                                presets : [ '@babel/preset-env' ]
                            }
                        }
                    }
                ]
            }
        } ) )
        .pipe( gulp.dest( path.build.js ) )
        .pipe( connect.reload() );
} );

gulp.task( 'style:build', () =>
{
    gulp.src( path.src.style )
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( sourcemaps.init() )
        .pipe( prefixer( { remove : false } ) )
        .pipe( gulp.dest( path.build.css ) )
        .pipe( connect.reload() );
} );

gulp.task( 'fonts:build', () =>
{
    gulp.src( '../src/fonts/fonts/**/*.*' )
        .pipe( gulp.dest( '../dist/fonts/fonts' ) );

    gulp.src( path.src.fonts )
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( sourcemaps.init() )
        .pipe( prefixer() )
        .pipe( gulp.dest( path.build.fonts ) )
        .pipe( connect.reload() );
} );

gulp.task( 'image:build', () =>
{
    gulp.src( path.src.img )
        .pipe( gulp.dest( path.build.img ) )
        .pipe( connect.reload() );
} );

gulp.task( 'build', [
    'html:build',
    'js:build',
    'style:build',
    'image:build',
    'fonts:build'
] );

gulp.task( 'release:build', [
    'release:image:build',
    'release:fonts:build',
    'release:html:build'
] );

gulp.task( 'watch', function()
{
    watch( [ path.watch.html ], ( event, cb ) =>
    {
        gulp.start( 'html:build' );
    } );
    watch( [ path.watch.style ], ( event, cb ) =>
    {
        gulp.start( 'style:build' );
    } );
    watch( [ path.watch.js ], ( event, cb ) =>
    {
        gulp.start( 'js:build' );
    } );
    watch( [ path.watch.img ], ( event, cb ) =>
    {
        gulp.start( 'image:build' );
    } );
} );

gulp.task( 'default', [ 'build', 'watch' ] );
