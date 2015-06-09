import Ember from "ember";
import TokenList from "../system/token-list";

var tokens = new TokenList();
var get = Ember.get;
var set = Ember.set;
var $ = Ember.$;


export default Ember.Component.extend({
  // Public API
  separator: null,
  title: null,
  prepend: null,
  replace: false,
  update: null,
  
  isVirtual: true,
  tagName: '',
  hidden: false,

  init: function () {
    // Clear default title
    if (tokens.length === 0) {
      document.title = '';
      if (get(this, 'separator') == null) {
        set(this, 'separator', ' | ');
      }
    }

    tokens.push(this);
    this._super.apply(this, arguments);
  },

  showSeparatorAfter: null,
  showSeparatorBefore: null,

  render: function (buffer) {
    var titleTag = document.getElementsByTagName('title')[0];
    var previous = get(this, 'previous');
    var replace = get(this, 'replace');
    var dom = buffer.dom || this.renderer._dom;
    if (previous && get(previous, 'prepend')) {
      if (get(previous, 'showSeparatorBefore')) {
        var pivot = get(previous, 'previous');
        if (pivot) {
          set(pivot, 'showSeparatorAfter', true);
        }
        set(previous, 'showSeparatorBefore', false);
      }
      set(this, 'showSeparatorAfter', true);
      //this._morph = buffer.dom.insertMorphBefore(titleTag, previous._morph.start);
      var firstNode = previous._morph.firstNode || previous._morph.start;
      //this._morph = buffer.dom.insertMorphBefore(titleTag, firstNode);
      this._morph = dom.insertMorphBefore(titleTag, firstNode);
      
    } else {
      set(this, 'showSeparatorBefore', !replace);
      //this._morph = buffer.dom.appendMorph(titleTag);
      this._morph = dom.appendMorph(titleTag);
      
    }
    this._super.apply(this, arguments);
  },

  willClearRender: function () {
    tokens.remove(this);
    var morph = this._morph;
    Ember.run.schedule('render', morph, morph.destroy);
    this._super.apply(this, arguments);
  },
  
  titleChangeObserver: function(){
    // remove html comments from document title
    document.title = document.title;
  }.observes('update')
});
