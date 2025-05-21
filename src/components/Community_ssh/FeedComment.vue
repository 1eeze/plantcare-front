<template>
  <div class="comments">
    <div v-if="comments.length === 0" class="no-comments">아직 댓글이 없습니다.</div>
    <ul>
      <li v-for="comment in comments" :key="comment.id">
        {{ comment.text }}
      </li>
    </ul>
    <form @submit.prevent="add">
      <input v-model="input" placeholder="댓글을 입력하세요" required />
      <button type="submit">등록</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ comments: Array })
const emit = defineEmits(['add-comment'])
const input = ref('')

function add() {
  if (!input.value) return
  emit('add-comment', input.value)
  input.value = ''
}
</script>

<style scoped>
.comments {
  background: #f6fff7;
  border-radius: 10px;
  padding: 10px;
}
.no-comments { color: #bbb; text-align: center; }
ul { padding: 0 0 6px 14px; margin: 0; }
form { display: flex; gap: 10px; }
input { flex: 1; border-radius: 6px; border: 1px solid #ccc; padding: 4px 7px; }
button { background: #b2e59f; color: #255b17; border: none; border-radius: 7px; padding: 3px 11px; }
</style>