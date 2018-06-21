var routes = [
    /* Pattern for route object:
     * {
     *     path: '...',
     *     setup: 'path_to_js_file'
     *     // Use 'setup' to call a JS page setup (without the '.page.js' part), inside 'pages' directory
     *  }
     *
     * Use "path: '*'" to apply the route to every path except the ones above (e.g.: 404 error page).
     * Use it as the last route.
     */


    {
        path: '',
        setup: '/home/home'
    },
    {
        path: 'cliente',
        setup: '/cliente/cliente'
    },
    {
        path: 'avaliacao',
        setup: '/avaliacao/avaliacao'
    },
    {
        path: 'avaliar',
        setup: '/avaliar/avaliar'
    }
];