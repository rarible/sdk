scripts_dir="$(dirname -- "$(readlink -f "${BASH_SOURCE}")")"
cd "${scripts_dir}/.."
cp mattel.env .env
mkcert marketplace-test.mattel.com
