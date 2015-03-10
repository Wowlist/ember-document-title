import Ember from "ember";
import TokenList from "../system/token-list";

var tokens = new TokenList(),
    get = Ember.get,
    set = Ember.set,
    $ = Ember.$;

export default Ember.Component.extend({
  // Public API
  separator: null,
  title: null,
  prepend: null,
  replace: false,

  isVirtual: true,
  tagName: '',
  hidden: false,

  init: function () {
    console.log('meta-description: init');
    // Clear default title
    if (tokens.length === 0) {
      //document.title = '';
      $('meta[name=description]').remove();
      if (get(this, 'separator') == null) {
        set(this, 'separator', ' | ');
      }
    }

    tokens.push(this);
    this._super.apply(this, arguments);
  },

  showSeparatorAfter: null,
  showSeparatorBefore: null,
  
  updateMetaTag: function(){
    var text = $('#meta-description').text();
    $('meta[name=description]').remove();
    $('head').append( '<meta name="description" content="'+text+'">' );
  },

  render: function (buffer) {
    console.log('meta-description: render');
    //var titleTag = document.getElementsByTagName('title')[0];
    var tag = $('#meta-description')[0];
    
    var previous = get(this, 'previous');
    var replace = get(this, 'replace');
    if (previous && get(previous, 'prepend')) {
      if (get(previous, 'showSeparatorBefore')) {
        var pivot = get(previous, 'previous');
        if (pivot) {
          set(pivot, 'showSeparatorAfter', true);
        }
        set(previous, 'showSeparatorBefore', false);
      }
      set(this, 'showSeparatorAfter', true);
      this._morph = buffer.dom.insertMorphBefore(tag, previous._morph.start);
    } else {
      set(this, 'showSeparatorBefore', !replace);
      this._morph = buffer.dom.appendMorph(tag);
    }
    this._super.apply(this, arguments);
    Ember.run.scheduleOnce('afterRender', this, 'updateMetaTag');
  },

  willClearRender: function () {
    console.log('meta-description: willClearRender');
    
    tokens.remove(this);
    var morph = this._morph;
    Ember.run.schedule('render', morph, morph.destroy);
    this._super.apply(this, arguments);
  }
});
