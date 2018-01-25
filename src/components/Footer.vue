<template>
  <footer>
    <nav class="navbar is-transparent">
      <div class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-item">
            <p class="control">
              <b-icon
                icon="copyright"
                size="is-small"/>
              <span v-once>
                Pair.ist {{ year }}
              </span>
            </p>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="field is-grouped">
              <p class="control">
                <a
                  class="bd-tw-button button"
                  href="https://github.com/luan/pairist">
                  <b-icon
                    icon="github-circle"
                    size="is-small"/>
                  <span>
                    Source
                  </span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  data() {
    return {
      year: (new Date()).getFullYear(),
    }
  },
}
</script>
