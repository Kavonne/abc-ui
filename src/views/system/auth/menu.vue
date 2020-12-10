<template>
  <div class="app-container">
    menu
  </div>
</template>

<script>
export default {
//   name: 'Tab',
//   components: { TabPane },
  data() {
    return {
      activeName: 'CN',
      createdTimes: 0
    }
  },
  created() {
  },
  methods: {
    showCreatedTimes() {
      this.createdTimes = this.createdTimes + 1
    }
  }
}
</script>
