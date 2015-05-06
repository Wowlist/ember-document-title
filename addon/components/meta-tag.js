import Ember from "ember";
import TokenList from "../system/token-list";

var tokensAllTypes = [],
    get = Ember.get,
    set = Ember.set,
    $ = Ember.$;

    //tokens = new TokenList(),

export default Ember.Component.extend({
  // Public API
  separator: null,
  title: null,
  prepend: null,
  replace: false,
  
  key: null,
  type: null,
  update: null,

  isVirtual: true,
  tagName: '',
  hidden: false,


  // computed properties
  
  typeSafe: function(){
    return get(this, 'type').replace(/:/g, "");
  }.property('type'),

  // observers
  doUpdate: function(){
    Ember.run.scheduleOnce('afterRender', this, 'updateLinkTag');    
  }.observes('update'),
  

  init: function () {
    // create a hidden container in the dom for rendering meta-tag templates
    if ( !$( "#meta-tag-render-container" ).length ) {
      $( "body" ).append( "<div id='meta-tag-render-container' style='display:none;'></div>" ); 
    }
    
    if(Ember.isEmpty(tokensAllTypes[get(this, 'typeSafe')])){
      tokensAllTypes[get(this, 'typeSafe')] = new TokenList();
    }
    var tokens = tokensAllTypes[get(this, 'typeSafe')];
    
    
    // Clear default title
    if (tokens.length === 0) {
      //document.title = '';
      
      if ( !$( "#meta-"+get(this, 'typeSafe') ).length ) {
        $( "#meta-tag-render-container" ).append( "<div id='meta-"+get(this, 'typeSafe')+"'></div>" );
      } else {
        $('#meta-'+get(this, 'typeSafe')).html('');
      }
      
      // remove meta tag
      var selector = this.makeSelector();
      $(selector).remove();
      
      if (get(this, 'separator') == null) {
        set(this, 'separator', ' | ');
      }
    }

    tokens.push(this);
    this._super.apply(this, arguments);
  },

  showSeparatorAfter: null,
  showSeparatorBefore: null,

  makeSelector: function(){
    return( "meta["+get(this, 'key')+"='"+get(this, 'type')+"']");
  },
  
  updateMetaTag: function(){
    var text = $('#meta-'+get(this, 'typeSafe')).text().replace("<!---->", "").trim();
    var selector = this.makeSelector();
    $(selector).remove();
    $('head').append( '<meta '+get(this, 'key')+'="'+get(this, 'type')+'" content="'+text+'" />' );
  },

  render: function (buffer) {

    //var titleTag = document.getElementsByTagName('title')[0];
    var tag = $('#meta-'+get(this, 'typeSafe'))[0];

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
    var tokens = tokensAllTypes[get(this, 'typeSafe')];
    
    tokens.remove(this);
    var morph = this._morph;
    Ember.run.schedule('render', morph, morph.destroy);
    this._super.apply(this, arguments);
  }
});
