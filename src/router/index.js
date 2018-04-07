import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import App from '../App'
import EditPanel from '@/page/EditPanel'
import FigurePanel from '@/page/FigurePanel'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/edit',
      component: EditPanel

    },
    {
      path: '/figure',
      component: FigurePanel
    }
  ]
})
