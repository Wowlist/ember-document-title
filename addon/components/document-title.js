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
  
  /**
    cleanTitleTag
    hack solution to remove html comments from the title tag
    preserves the nodes so as not to break ember binding
  */
  
  cleanTitleTag: function (node) {
    for(var n = 0; n < node.childNodes.length; n ++) {
      var child = node.childNodes[n];

      if ( child.nodeType === 8 ) {
        node.insertBefore(document.createTextNode(""), child);
        node.removeChild(child);
      }
    }
  },
  
  titleChangeObserver: function(){
    var self = this;
    // remove html comments from document title
    Ember.run.next(this, function() {
      var title = $('title')[0];
      self.cleanTitleTag(title);
    });
  }.observes('update').on('init')
});
