from setuptools import setup, find_packages


# MANIFEST.in https://docs.python.org/2/distutils/sourcedist.html#the-manifest-in-template
# https://packaging.python.org/tutorials/distributing-packages/

setup(
    name='bigtiger',
    version='0.3.7',
    author='bigtiger',
    author_email='chinafengheping@gmail.com',
    url='http://www.hshl.ltd',
    description=u'similar django admin',
    packages=find_packages(),  # include all packages under src
    include_package_data=True,    # include everything in source control
    install_requires=[
        'Django>=1.7.7',
        'pycrypto>=2.6.1',
        'djangorestframework>=3.3.1',
        'djangorestframework-xml>=1.3.0',
        'xlrd>=0.9.3',
        'xlutils>=1.7.1',
        'xlwt>=0.7.5',
        'sqlalchemy-django>=0.0.4'
    ]
)
