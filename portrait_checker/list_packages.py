import pkg_resources

def list_installed_packages():
    packages = sorted([(d.project_name, d.version) for d in pkg_resources.working_set])
    print("{:<40}{}".format("Package", "Version"))
    print("-" * 55)
    for name, version in packages:
        print("{:<40}{}".format(name, version))

if __name__ == "__main__":
    list_installed_packages()
