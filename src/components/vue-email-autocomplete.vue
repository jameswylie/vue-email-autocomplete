<template>
    <div>
      <slot></slot>
      <div class="auto-complete-container" :style='css && typeof css.container !== null ? css.container : null'>
      <div class="auto-complete-overlay" v-if='overlayVisible && matches.length > 0' :style='css && typeof css.overlay !== null ? css.overlay : null'>
        <ul>
          <li v-for='(match, index) in matches' :key='match' @click='completeInput(inputVal+match.completion)' :class='index === selectedMatch ? "selected" : ""'><span v-html='inputVal'></span><span class="completion" v-html='match.completion'></span></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'vue-email-autocomplete',
  props: {

    css: {
      type: Object,
      required: false,
      default: null
    },

    onCompletion: {
      type: Function,
      required: true
    },

    onSubmit: {
      type: Function,
      required: false,
      default: null
    },

    domains: {
      type: Array,
      required: false,
      default: null
    }

  },

  data() {
    return {
      inputVal: '',
      inputEle: null,
      model: null,
      overlayVisible: false,
      actionKeys: [38, 40, 13, 27],
      matches: [],
      selectedMatch: null
    }
  },
  computed: {
    vendors() {

      if(this.domains && this.domains.length > 0) {
        return this.domains;
      }

      return [
        'gmail.com',
        'googlemail.com',
        'comcast.net',
        'yahoo.com',
        'hotmail.com',
        'hotmail.co.uk',
        'aol.com',
        'msn.com',
        'yahoo.co.uk',
        'live.com',
        'live.co.uk',
        'icloud.com'
      ];

    }
  },
  methods: {

    check(e) {

      if(this.isActionKey(e.keyCode)) {

        this.invokeAction(e, e.keyCode);
        return true;

      }

      const ele = e.target;
      this.inputEle = e.target;
      this.inputVal = ele.value;

      this.resetMatches();

      this.filterVendors(ele.value);

    },

    isActionKey(keyCode) {

      return this.actionKeys.includes(keyCode);

    },

    invokeAction(e, keyCode) {

      switch(keyCode) {

        case 38:
        //up
        e.preventDefault();
        e.stopPropagation();
        this.navigateSuggestions('up');
        break;

        case 40:
        //down
        e.preventDefault();
        e.stopPropagation();
        this.navigateSuggestions('down');
        break;

        case 13:
        //enter
        e.preventDefault();
        e.stopPropagation();
        this.selectSuggestion(e);
        break;

        case 27:
        //enter
        e.preventDefault();
        e.stopPropagation();
        this.closeOverlay();
        break;


      }

    },

    navigateSuggestions(direction) {

      if(this.matches.length < 1) {
        return false;
      }

      if(direction === 'down'){

        if(this.selectedMatch === null) {
          this.selectedMatch = 0;
          return true;
        }else if(this.selectedMatch !== null && (this.selectedMatch+1) < this.matches.length) {
          this.selectedMatch++;
          return true;
        }

      }

      if(direction === 'up'){

        if(this.selectedMatch !== null && this.selectedMatch > 0) {
          this.selectedMatch--;
          return true;
        }

      }

    },

    selectSuggestion() {

      if(this.selectedMatch !== null) {

        this.completeInput(this.inputVal+this.mapSuggestion(this.selectedMatch).completion);

      }else{

        setTimeout(() => {
          if(this.onSubmit) {
            this.onSubmit();
          }
        }, 0);

      }

    },

    mapSuggestion(matchKey) {

      return this.matches[matchKey];

    },

    completeInput(completedStr) {

      if(this.onCompletion){
        this.onCompletion(completedStr);
      }

      this.closeOverlay();

    },

    closeOverlay() {

      this.overlayVisible = false;
      this.resetMatches();

    },

    resetMatches() {

      this.matches = [];
      this.selectedMatch = null;

    },

    setMatches(matches) {

      this.matches = matches;
      this.overlayVisible = true;

    },

    sortMatches(matches) {

      return matches.sort((a, b) => {
        return (a.vendor < b.vendor) ? -1 : (a.vendor > b.vendor) ? 1 : 0;
      });

    },

    computeMatches(vendor_search) {

      const matches = [];

      this.vendors.forEach(function(vendor) {

        const partialPossibleVendor = vendor.substring(0, vendor_search.length);

        if(partialPossibleVendor.length !== vendor.length && vendor_search === partialPossibleVendor) {

          matches.push({
            vendor: vendor,
            completion: vendor.substring(vendor_search.length, vendor.length)
          });

        }

      });

      if(matches.length > 0) {
        this.setMatches(this.sortMatches(matches));
      }

    },

    filterVendors(input) {

      const parts = input.split('@');

      if(input.includes('@') && parts[1].length > 0){

        this.computeMatches(parts[1]);

      }

    },

    outsideComponentClick(e) {

      if(e.target instanceof HTMLElement && !this.$el.contains(e.target)) {
        this.overlayVisible = false;
      }

    }

  },

  mounted() {

    document.documentElement.addEventListener('click', (e) => this.outsideComponentClick(e), false);

  },

  beforeDestroy() {

    document.documentElement.removeEventListener('click', (e) => this.outsideComponentClick(e), false);

  }

}

</script>

<style scoped>

  .auto-complete-container {
    position: relative;
  }

  .auto-complete-overlay {
    border-radius: 2px;
    z-index: 10;
    position: absolute;
    width: 100%;
    top: 100%;
    background-color: #FCFCFC;
    border: 1px solid #EDEDED;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 12px 15px 12px 15px;
    cursor: pointer;
    border-bottom: 1px solid #EDEDED;
    will-change: background-color;
    transition: background-color .2s ease-in-out;
  }

  li.selected {
    background-color: #F3F3F3;
  }

  li:last-child {
    border: none;
  }

  .auto-complete-overlay >>> span.completion {
    color: #0787ad;
  }

</style>
