function deleteProduct(btn) {
  const productId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  fetch('/admin/product/' + productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      if (result.status === 200 && result.statusText === 'OK') {
        btn.closest('article').remove();
      }
    })
    .catch(console.log);
}
